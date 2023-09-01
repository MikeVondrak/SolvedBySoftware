import { updateNav, setMarkerPosition } from "./main-nav";

var currentPageId: string = "";
var debounce: boolean = false;

/**
 * Update the virtual screen that displays content based on Main Nav selection
 */
export function updateScreen() {
  const contentPanes = document.querySelectorAll<HTMLDivElement>(
    "#Screen [data-content-id]"
  );
  console.log("Update Screen:", currentPageId, contentPanes.length);

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
      console.log(`ID: ${id}, ${currentPageId}`);
      pane.style.display = "block";
      setTimeout(() => {
        // set timeout so opacity change doesn't happen the same cycle as display block (interrupts animation)
        pane.style.opacity = "1";
      }, 1);
    }
  });
}

/**
 *
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

function addResizeHandler() {
  window.addEventListener("resize", (event: Event) => {
    handeScroll(event);
  });
}

function addScrollHandler() {
  window.addEventListener("scroll", handeScroll);
}

function handeScroll(event: Event) {
  if (window.innerHeight > 868) {
  }
}

function addIntersectionObserver() {
  const titleElement = document.getElementById("ContentTop");
  if (!titleElement) {
    throw new Error('No target for intersection');
  }

  // Options for the Intersection Observer
  const options = {
    root: null, // Use the viewport as the root
    rootMargin: "0px",
    threshold: 0.0, // 100% of the target element must be visible to trigger the callback
  };

  // Callback function when the intersection occurs
  const handleIntersection = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log("Title element is now visible in the viewport!");
        window.removeEventListener('scroll', handeScroll);
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
export const loadPage = (pageId: string) => {
  currentPageId = pageId;
  console.log("LOAD PAGE ", currentPageId);
  updateNav(currentPageId);
  updateScreen();
  setMarkerPosition(currentPageId);
};

/**
 * Main App
 */
(() => {
  console.log("-------- SBS APP INIT ---------");
  currentPageId = "";
  debounce = false;
  document.addEventListener("DOMContentLoaded", ($event) => {
    addMainNavHandlers();
    // addScrollHandler(); 
    addResizeHandler();
    // addIntersectionObserver(); // 
    loadPage("Home");
  });
  window.addEventListener("resize", ($event) => {
    if (debounce) {
      return;
    }
    loadPage(currentPageId);
    debounce = true;
    // Load the page one final time after a short timeout to make sure we're in the correct UI state
    setTimeout(() => {
      debounce = false;
      loadPage(currentPageId);
    }, 250);
  });
})();
