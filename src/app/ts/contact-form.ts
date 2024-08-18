const formSelector = '#ContactUs';
const labelSelector = 'label';
const topicSelection = [];
let el: HTMLElement | null;

export function initialize() {
  el = document.querySelector(formSelector);
  

  if (!el) {
    console.error('Contact form element not found');
    return;
  }
  const labels = el.querySelectorAll(labelSelector);
  labels.forEach((label) => {
    label.addEventListener('click', ($event) => topicClick($event));
  });
}

export function topicClick($event: Event) {
  console.log('-----------------', $event, $event.target);
  const labelEl = $event.target as HTMLElement;
  labelEl.classList.toggle('selected');
}

