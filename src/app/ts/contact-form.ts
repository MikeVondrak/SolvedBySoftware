const enum TopicIds {
  APP_DEV = 'Application Development',
  DATA_MIG = 'Data Migration',
  LIGHTNING_MIG = 'Lightning Migration',
  SF_AUTO = 'Salesforce Automation',
  REPORTING = 'Reporting & Dashboards',
  THIRD_PARTY = 'Third-Party App Integration'
}
let topicsSelected: TopicIds[] = []; 

const formSelector = '#ContactUs';
const labelSelector = 'label';
const checkboxSelector = 'input';
const topicSelection = [];
let el: HTMLElement | null;
let labels: NodeListOf<HTMLElement>;
let checkboxes: NodeListOf<HTMLElement>;

export function initialize() {
  el = document.querySelector(formSelector);
  

  if (!el) {
    console.error('Contact form element not found');
    return;
  }
  labels = el.querySelectorAll(labelSelector);
  if (!labels) {
    console.error('Contact form labels not found');
    return;
  }
  labels.forEach((label) => {
    label.addEventListener('click', ($event) => topicClick($event));
  });

  checkboxes = el.querySelectorAll(checkboxSelector);
  if (!checkboxes) {
    console.error('Contact form checkboxes not found');
    return;
  }
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('click', ($event) => topicClick($event));
  });
}

export function topicClick($event: Event) {
  $event.stopPropagation();
  console.log('-----------------', $event, $event.target);
  const clickedEl = $event.target as HTMLElement;
  const labelEl = clickedEl?.parentElement?.parentElement; 
  if (!labelEl) {
    console.error('Cannot find parent label element of click');
  }
  console.log(labelEl?.nodeName);
  labelEl?.classList.toggle('selected');


  // TODO - update the email text that will be sent
  //updateEmail();
}

