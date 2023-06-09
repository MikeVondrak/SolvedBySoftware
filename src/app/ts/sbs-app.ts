import { updateNav, setMarkerPosition } from './main-nav';

var currentPageId: string = '';
var debounce: boolean = false;

/**
 * Update the virtual screen that displays content based on Main Nav selection
 */
export function updateScreen() {
  const contentPanes = document.querySelectorAll<HTMLDivElement>('#Screen [data-content-id]');
  console.log('Update Screen:', currentPageId,  contentPanes.length);
  
  contentPanes.forEach(pane => {
    const id = pane.getAttribute('data-content-id');
    if (id !== currentPageId) {
      pane.style.opacity = '0';
      setTimeout(() => {
        // set timeout so display none doesn't interrupt animation
        pane.style.display = 'none';
      }, 150);
    }

    if (id === currentPageId) {
      console.log(`ID: ${id}, ${currentPageId}`);
      pane.style.display = 'block';
      setTimeout(() => {
        // set timeout so opacity change doesn't happen the same cycle as display block (interrupts animation)
        pane.style.opacity = '1';
      }, 1);
    }
  });
}

/**
 * 
 */
function addMainNavHandlers() {
  const mainNavButtons = document.querySelectorAll('button[data-main-nav]');
  mainNavButtons.forEach((buttonNode: Element) => {
    buttonNode.addEventListener("click", ($event) => {      
      const id = buttonNode?.attributes?.getNamedItem('data-main-nav')?.value;
      if (!id) {
        console.error('Could not add event listener to Main Nav');
        return;
      }
      loadPage(id);
    })
  });
}


export const loadPage = (pageId: string) => {
  currentPageId = pageId;
  console.log('LOAD PAGE ', currentPageId);
  updateNav(currentPageId);
  updateScreen();
  setMarkerPosition(currentPageId);  
}

/**
 * Main App
 */
(() => {
  console.log('-------- SBS APP INIT ---------');
  currentPageId = '';
  debounce = false;
  document.addEventListener("DOMContentLoaded", ($event) => {
    addMainNavHandlers();
    loadPage('Home');
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


