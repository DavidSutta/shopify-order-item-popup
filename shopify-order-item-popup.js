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

    const CLASS_OF_ITEMLIST_POPUP_DIV = 'Polaris-PositionedOverlay'
    const QUERY_SELECTOR_FOR_THUMBNAIL_CONTAINER_IN_POPUP = 'div[class^="_ThumbnailContainer"]'
    const TIME_TO_WAIT_FOR_POPUP_TO_LOAD_MS = 1000
    const ID_FOR_CUSTOM_POPUP = 'cstm-popup-with-image'

    function getMultipliedResolutionImageUrl(imageUrl, multiplicationFactor) {
        // ImageURL looks like this:
        // https://cdn.shopify.com/s/files/asd/0000/files/3fd0dsadasdbfdsfsdf2b_160x160.jpg?v=9999999999
        imageUrl = imageUrl.replace(/_(\d+)x(\d+)(\.\w+)/, function (match, width, height, extension) {
            const newWidth = parseInt(width) * multiplicationFactor;
            const newHeight = parseInt(height) * multiplicationFactor;
            return `_${newWidth}x${newHeight}${extension}`;
        });

        return imageUrl;
    }

    function createCustomPopupWithImage(imageUrl, imagePopupId, maxWidth, maxHeight) {
        const popup = document.createElement('div');
        popup.id = imagePopupId;
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

        // Calculate the default position
        let top = rect.bottom + window.scrollY;
        let left = rect.left;

        // Check if the popup would go off the right edge of the viewport
        if (left + maxWidth > viewportWidth) {
            left = viewportWidth - maxWidth - 10; // Adjust to fit within the viewport with a small margin
        }

        // Check if the popup would go off the bottom edge of the viewport
        if (top + maxHeight > viewportHeight + window.scrollY) {
            top = rect.top + window.scrollY - maxHeight - 10; // Adjust to position above the element
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
        popup.style.transition = 'opacity 0.3s ease-in-out';

        // Create the image element for the popup
        const popupImage = document.createElement('img');
        popupImage.src = imageUrl;
        popupImage.style.maxWidth = `${maxWidth}px`;
        popupImage.style.maxHeight = `${maxHeight}px`;
        
        popup.appendChild(popupImage);
        return popup;
    }

    // Function to add hover effect to item images
    function addHoverEffectToItemImages() {
        // Select all item images within the popup
        const itemImageContainerDiv = document.querySelectorAll(QUERY_SELECTOR_FOR_THUMBNAIL_CONTAINER_IN_POPUP);

        itemImageContainerDiv.forEach(function(imgDiv) {
            const img = imgDiv.querySelector('img');

            imgDiv.addEventListener('mouseenter', function() {
                // Get the URL of the thumbnail image
                let imageUrl = img.src;

                // Find and double the resolution (e.g., 160x160 -> 320x320)
                imageUrl = getMultipliedResolutionImageUrl(imageUrl, 2);

                // Create the popup element with the image in it
                const popup = createCustomPopupWithImage(imageUrl, ID_FOR_CUSTOM_POPUP, 300, 300)

                // Add the popup to the document
                document.body.appendChild(popup);

                // Trigger the fade-in effect by setting opacity to 1
                setTimeout(() => {
                    popup.style.opacity = '1';
                }, 0); // Using timeout to allow browser to apply initial styles first
            });

            imgDiv.addEventListener('mouseleave', function() {
                // Remove the popup when the mouse leaves
                const popup = document.getElementById(ID_FOR_CUSTOM_POPUP);
                if (popup) {
                    popup.remove();
                }
            });
        });
    }

    // MutationObserver to detect opening item list and trigger the popup on hover
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                // Check if the added node contains the appropriate class --> This means that an item list popup was opened,
                // thus we have to add the events
                if (node.nodeType === 1 && node.classList.contains(CLASS_OF_ITEMLIST_POPUP_DIV)) {
                    // Call the function to add hover effect to images
                    setTimeout(function(){
                        addHoverEffectToItemImages();
                    }, TIME_TO_WAIT_FOR_POPUP_TO_LOAD_MS);
                }
            });
        });
    });

    // Observe the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });
})();
