export function setMarkerPosition(pos: string) {
  const prefix = "markerPos_";
  const prefixLg = "markerPosLg_";
  const viewportX = window.innerWidth;

  const markerId = (viewportX >= 1024 ? prefixLg : prefix) + pos;
  const markerEl = document.getElementById("MainNavMarker");
  if (!markerEl) {
    console.error("Could not get marker element");
    return;
  }

  const style = window.getComputedStyle(markerEl);
  const newMarkerX = style.getPropertyValue("--" + markerId);  
  markerEl.style.left = newMarkerX;
  console.log('setMarkerPosition:', markerId, newMarkerX);
}

export function updateNav(currentPageId: string) {
  console.log('--- Update nav: ', currentPageId);
  const buttonEls = document.querySelectorAll<HTMLButtonElement>('[data-content-id="CarouselNavMain"] button');
  buttonEls.forEach(button => {
    console.log('--- On page: ', currentPageId);
    button.disabled = false;
    if (button.getAttribute('data-main-nav') === currentPageId) {
      button.disabled = true;
    };
  })
}
