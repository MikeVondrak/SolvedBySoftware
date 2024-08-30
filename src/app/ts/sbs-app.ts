import { updateNav, setMarkerPosition } from "./main-nav";
import * as contactForm from "./contact-form";

var currentPageId: string = "";
var resizeDebounce: boolean = false;

/**
 * Update the virtual screen that displays content based on Main Nav selection
 */
function updateScreen() {
  const contentPanes = document.querySelectorAll<HTMLDivElement>(
    "#Screen [data-content-id]"
  );
  contentPanes.forEach((pane) => {
    const id = pane.getAttribute("data-content-id");
    if (id !== currentPageId) {
      pane.style.opacity = "0";
      setTimeout(() => {
        // set timeout so display none doesn't interrupt animation
        pane.style.display = "none";
      }, 150);
    }

    if (id === currentPageId) {
      pane.style.display = "block";
      setTimeout(() => {
        // set timeout so opacity change doesn't happen the same cycle as display block (interrupts animation)
        pane.style.opacity = "1";
      }, 1);
    }
  });
}

/**
 * Attach click handlers for main navigation
 */
function addMainNavHandlers() {
  const mainNavButtons = document.querySelectorAll("button[data-main-nav]");
  mainNavButtons.forEach((buttonNode: Element) => {
    buttonNode.addEventListener("click", ($event) => {
      const id = buttonNode?.attributes?.getNamedItem("data-main-nav")?.value;
      if (!id) {
        console.error("Could not add event listener to Main Nav");
        return;
      }
      loadPage(id);
    });
  });
}

/**
 * Attach window resize logic
 */
function addResizeHandler() {
  // limit handling resize to every 250ms
  resizeDebounce = false;

  window.addEventListener("resize", ($event: Event) => {
    if (resizeDebounce) {
      return;
    }
    loadPage(currentPageId);
    resizeDebounce = true;
    // Load the page one final time after a short timeout to make sure we're in the correct UI state post-resizing
    setTimeout(() => {
      resizeDebounce = false;
      loadPage(currentPageId);
    }, 250);
  });
}

/**
 * 
 */
function addScrollButtonIntersectionObserver() {
  const titleElement = document.getElementById("ContentTop");
  if (!titleElement) {
    throw new Error('No target for intersection');
  }

  // Options for the Intersection Observer
  const options = {
    root: null, // Use the viewport as the root
    rootMargin: "0px",
    threshold: 0.1, // % of the target element that must be visible to trigger the callback
  };

  // Callback function when the intersection occurs
  const handleIntersection = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const scrollBtn = document.getElementById('ScrollDown');
        if (!scrollBtn) {
          throw new Error('No scroll button');
        }
        scrollBtn.style.opacity = '0';
      }
    });
  };

  // Create the Intersection Observer instance
  const observer = new IntersectionObserver(handleIntersection, options);

  // Start observing the target element
  observer.observe(titleElement);
}

/**
 *
 * @param pageId
 */
function loadPage(pageId: string) {
  currentPageId = pageId;
  updateNav(currentPageId);
  updateScreen();
  setMarkerPosition(currentPageId);
};

/**
 * Initialize app on first load
 */
function initializeApp($event: Event) {
  addMainNavHandlers();
  addResizeHandler();
  loadPage("Home");
  addScrollButtonIntersectionObserver();
  contactForm.initialize();
}

/**
 * Main App
 */
(() => {
  console.log("-------- SBS APP INIT ---------");
  currentPageId = "";
  document.addEventListener("DOMContentLoaded", ($event) =>
    initializeApp($event)
  );
  addResizeHandler();
})();
