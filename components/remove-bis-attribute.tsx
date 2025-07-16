"use client";

import { useEffect } from "react";

export function RemoveBisAttribute() {
  useEffect(() => {
    // Function to remove bis_skin_checked attributes
    const removeBisAttributes = () => {
      const elements = document.querySelectorAll('[bis_skin_checked]');
      elements.forEach(el => {
        el.removeAttribute('bis_skin_checked');
      });
    };

    // Run once on mount
    removeBisAttributes();

    // Set up a MutationObserver to watch for new elements with the attribute
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
          const target = mutation.target as Element;
          target.removeAttribute('bis_skin_checked');
        }
      });
    });

    // Start observing the document
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked']
    });

    // Clean up observer on unmount
    return () => observer.disconnect();
  }, []);

  return null;
} 