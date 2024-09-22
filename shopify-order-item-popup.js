// ==UserScript==
// @name         Shopify Orders Image Popup on Hover
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Displays a popup with an enlarged image when hovering over an item image in the orders popup
// @author       David Sutta
// @match        https://your-shopify-admin-url/orders*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to add hover effect to item images
    function addHoverEffectToItemImages() {
        // Select all item images within the popup
        const itemImageContainerDiv = document.querySelectorAll('div[class^="_ThumbnailContainer"]');

        itemImageContainerDiv.forEach(function(imgDiv) {
            const img = imgDiv.querySelector('img'); // Ensure img is scoped correctly

            imgDiv.addEventListener('mouseenter', function() {
                // Get the URL of the image
                let imageUrl = img.src; // Assuming the img element has the src with the image URL

                // Find and double the resolution (e.g., 160x160 -> 320x320)
                imageUrl = imageUrl.replace(/_(\d+)x(\d+)(\.\w+)/, function(match, width, height, extension) {
                    const newWidth = parseInt(width) * 2;
                    const newHeight = parseInt(height) * 2;
                    return `_${newWidth}x${newHeight}${extension}`;
                });

                // Create a popup to display the image
                const popup = document.createElement('div');
                popup.id = 'image-popup';
                popup.style.position = 'absolute';
                popup.style.backgroundColor = 'white';
                popup.style.padding = '10px';
                popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                popup.style.zIndex = '9999';
                // Get the dimensions of the viewport
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // Get the popup's intended position and size
                const rect = imgDiv.getBoundingClientRect();
                const popupWidth = 300; // Adjust based on your maxWidth setting
                const popupHeight = 300; // Adjust based on your maxHeight setting

                // Calculate the default position
                let top = rect.bottom + window.scrollY;
                let left = rect.left;

                // Check if the popup would go off the right edge of the viewport
                if (left + popupWidth > viewportWidth) {
                    left = viewportWidth - popupWidth - 10; // Adjust to fit within the viewport with a small margin
                }

                // Check if the popup would go off the bottom edge of the viewport
                if (top + popupHeight > viewportHeight + window.scrollY) {
                    top = rect.top + window.scrollY - popupHeight - 10; // Adjust to position above the element
                }

                // Check if the popup would go off the left edge of the viewport
                if (left < 0) {
                    left = 10; // Adjust to prevent the popup from going off the left edge
                }

                // Check if the popup would go off the top edge of the viewport
                if (top < window.scrollY) {
                    top = rect.bottom + window.scrollY + 10; // Adjust to position below the element
                }

                // Set the final position of the popup
                popup.style.top = `${top}px`;
                popup.style.left = `${left}px`;

                // Set initial styles for fade-in effect
                popup.style.opacity = '0';
                popup.style.transition = 'opacity 0.3s ease-in-out'; // Transition for fade-in effect

                // Create the image element for the popup
                const popupImage = document.createElement('img');
                popupImage.src = imageUrl; // Set the image URL here
                popupImage.style.maxWidth = '300px'; // Set the max width for the popup image
                popupImage.style.maxHeight = '300px'; // Set the max height for the popup image

                // Add the image to the popup
                popup.appendChild(popupImage);

                // Add the popup to the document
                document.body.appendChild(popup);

                // Trigger the fade-in effect by setting opacity to 1
                setTimeout(() => {
                    popup.style.opacity = '1';
                }, 0); // Using timeout to allow browser to apply initial styles first
            });

            imgDiv.addEventListener('mouseleave', function() {
                // Remove the popup when the mouse leaves
                const popup = document.getElementById('image-popup');
                if (popup) {
                    popup.remove();
                }
            });
        });
    }

    // MutationObserver to detect changes inside 'PolarisPortalsContainer' and trigger hover effect
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                // Check if the added node contains the class 'Polaris-PositionedOverlay'
                if (node.nodeType === 1 && node.classList.contains('Polaris-PositionedOverlay')) {
                    // Call the function to add hover effect to images
                    setTimeout(function(){
                        addHoverEffectToItemImages();
                    }, 1000);
                }
            });
        });
    });

    // Observe the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
})();
