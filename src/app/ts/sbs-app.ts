(function sbsApp() {
  console.log('-------- SBS APP INIT ---------');

  document.addEventListener("DOMContentLoaded", function(event) {
    loadPage('Home');
  });
})();

var currentPageId: string = '';

function loadPage(pageId: string) {
  currentPageId = pageId;
  console.log('LOAD PAGE ', currentPageId);
  updateNav();
  updateScreen();
  setMarkerPosition(currentPageId);
}

function updateNav() {
  console.log('Update NAV ', currentPageId);
  const buttonEls = document.querySelectorAll<HTMLButtonElement>('[data-content-id="CarouselNavMain"] button');
  buttonEls.forEach(button => {
    console.log('ON PAGE: ', currentPageId);
    button.disabled = false;
    if (button.getAttribute('data-click') === currentPageId) {
      button.disabled = true;
    };
  })
}

function updateScreen() {
  const contentPanes = document.querySelectorAll<HTMLDivElement>('#Screen [data-content-id]');
  console.log('UPDATE SCREEN!!!', currentPageId,  contentPanes.length);
  
  contentPanes.forEach(pane => {
    const id = pane.getAttribute('data-content-id');
    //if (parseInt(pane.style.opacity) > 0) {
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

  console.log('Update NAV ', currentPageId);
  const screenEl = document.getElementById('Screen');
}

updateScreen();