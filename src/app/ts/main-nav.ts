export function setMarkerPosition(pos: string) {
  const prefix = "markerPos_";
  const prefixXs = "markerPosXs_";
  const prefixSm = "markerPosSm_";
  const prefixMd = "markerPosMd_";
  const prefixLg = "markerPosLg_";
  const prefixXl = "markerPosXl_";
  const prefixWs = "markerPosWs_";
  const prefixHd = "markerPosHd_";
  const viewportX = window.innerWidth;

  let markerId = prefix;
  markerId =
    viewportX >= 1920
      ? prefixHd
      : viewportX >= 1440
      ? prefixWs
      : viewportX >= 1280
      ? prefixXl
      : viewportX >= 1024
      ? prefixLg
      : viewportX >= 840
      ? prefixMd
      : viewportX >= 600
      ? prefixSm
      : viewportX >= 400
      ? prefixXs
      : prefix;
  markerId += pos;
  
  console.log('!!!', markerId, viewportX);
  
  const markerEls = document.querySelectorAll<HTMLDivElement>(
    "[data-id='MainNavMarker']"
  );
  console.log("+++", { pos }, { markerId });
  if (!markerEls.length) {
    console.error("Could not get marker element");
    return;
  }
  markerEls.forEach((markerEl) => {
    const style = window.getComputedStyle(markerEl);
    const newMarkerX = style.getPropertyValue("--" + markerId);
    markerEl.style.transform = `translateX(${newMarkerX})`;
  });
}

export function updateNav(currentPageId: string) {
  console.log("--- Update nav: ", currentPageId);
  const buttonEls = document.querySelectorAll<HTMLButtonElement>(
    '[data-content-id="CarouselNavMain"] button'
  );
  buttonEls.forEach((button) => {
    console.log("--- On page: ", currentPageId);
    button.disabled = false;
    if (button.getAttribute("data-main-nav") === currentPageId) {
      button.disabled = true;
    }
  });
}
