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
  console.log('UPDATE SCREEN!!!', contentPanes.length);
  
  contentPanes.forEach(pane => {
    pane.style.opacity = '0';
    pane.style.display = 'none';

    const id = pane.getAttribute('data-content-id');
    console.log(`ID: ${id}, ${currentPageId}`);
    if (id === currentPageId) {
      pane.style.display = 'block';
      pane.style.opacity = '1';
    }
  });

  console.log('Update NAV ', currentPageId);
  const screenEl = document.getElementById('Screen');


}