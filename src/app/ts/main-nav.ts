function setMarkerPosition(pos: string) {
  const prefix = 'markerPos_';
  const markerId = prefix + pos;
  const markerEl = document.getElementById('MainNavMarker');
  if (!markerEl) {
    console.error('Could not get marker element');
    return;
  }
  const style = window.getComputedStyle(markerEl);
  const newMarkerX = style.getPropertyValue('--' + markerId);
  const leftPos = style.left;

  console.log("MOVING MARKER", markerId, leftPos, newMarkerX);

  markerEl.style.left = newMarkerX;
}
