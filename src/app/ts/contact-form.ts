enum TopicIds {
  APP_DEV = 'Application Development',
  DATA_MIG = 'Data Migration',
  LIGHTNING_MIG = 'Lightning Migration',
  SF_AUTO = 'Salesforce Automation',
  REPORTING = 'Reporting & Dashboards',
  THIRD_PARTY = 'Third-Party App Integration',
  OTHER = 'Other Topic',
}

type TopicId = keyof typeof TopicIds;

const topicArray: TopicId[] = Object.keys(TopicIds).map(topic => topic as TopicId);

// initialize all inputs in the checkbox group to clean
let topicDirty: Map<TopicId, boolean> = new Map(topicArray.map(topic => [topic as TopicId, false]));

const formSelector = 'ContactUs';
const labelSelector = 'label';
const checkboxSelector = 'input[type="checkbox"]';
const topicOtherTextareaSelector = 'OtherTopic';
const topicOtherCheckmarkSelector = 'OtherTopicCheckmark';
const formSubmitSelector = 'SubmitInquiry';
let formEl: HTMLElement | null;
let labels: NodeListOf<HTMLElement>;
let checkboxes: NodeListOf<HTMLElement>;

export function initialize() {
  // Get form element  
  formEl = document.getElementById(formSelector);
  if (!formEl) {
    console.error('Contact form element not found');
    return;
  }
  // Get labels for Topic checkbox group
  labels = formEl.querySelectorAll(labelSelector);
  if (!labels) {
    console.error('Contact form labels not found');
    return;
  }
  // Get checkbox inputs
  checkboxes = formEl.querySelectorAll(checkboxSelector);
  if (!checkboxes) {
    console.error('Contact form checkboxes not found');
    return;
  }
  // Get submit input
  const submitInput = document.getElementById(formSubmitSelector) as HTMLInputElement;
  if (!submitInput) {
    console.error('Contact form submit not found');
    return;
  }

  // Add a click event for each label
  labels.forEach((label) => {
    label.addEventListener('click', ($event) => topicClick($event));
  });

  // Prevent the default click event on checkboxes so we can handle it from the parent label
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('click', ($event) => {
      $event.preventDefault();
    });
  });

  // Set up validation for the "Other" topic option
  const otherText = document.getElementById(topicOtherTextareaSelector);
  if(!otherText) {
    console.error('Contact form other text not found');
    return;
  }
  otherText?.addEventListener('input', (ev) => handleTextInput(ev));

  // Override the form submit so we can do custom validation 
  formEl.addEventListener('submit', handleSubmit);
  console.log('----', {submitInput});
}
/**
 * Handle form submission asynchronously
 * @param $event Submit event from form
 */
function handleSubmit($event: SubmitEvent) {
  console.log('--- SUBMIT', {$event});
  $event.preventDefault();
  $event.stopPropagation();
  // TODO - logic
}
/**
 * Handle input changes for the Other topic option textarea
 * @param $event Input event
 * @returns 
 */
function handleTextInput($event: Event) {
  const otherText = $event.target as HTMLTextAreaElement;
  const otherCheckmark = document.getElementById(topicOtherCheckmarkSelector) as HTMLInputElement;
  if (!otherText || !otherCheckmark) {
    throw new Error('Cannot find textarea and/or checkbox');
  }
  const val = otherText.value.trim();
  otherCheckmark.checked = val.length > 0;
  if (otherCheckmark.checked) {
    otherCheckmark.value = val;
  }
  const topicId: TopicId = otherText.getAttribute('data-topic-id') as TopicId;
  const event: InputEvent = $event as InputEvent;
  console.log('###', {topicId}, {event});
  if (!topicId) {
    throw new Error('Cannot get topic ID of textbox');
  }
  if (!topicDirty.get(topicId)) {
    setTopicDirty(topicId);
  }
}

function getTopicDirtyAny() {
  return Array.from(topicDirty.values()).includes(true);
}

function setTopicDirty(topicId: TopicId) {
  if (!topicId) {
    console.error('Cannot get ID of topic');
    return;
  }
  topicDirty.set(topicId, true);  
  console.log('--- Dirty: ', {topicDirty});
}

function topicClick($event: PointerEvent | MouseEvent) {
  
  console.log('--- TOPIC CLICK', {$event});

  // Stop propagation to avoid multiople events on a single click
  $event.stopPropagation();
  // Prevent default to avoid native click of input capturing event
  // - NOTE: Must control focus manually to get e.g. outline when focused
  $event.preventDefault();

  const clickedEl = $event.target;// as HTMLElement;
  if (!(clickedEl instanceof Element)) {
    console.error('Cannot get element from PointerEvent');
    return;
  }
  // TODO - generalized solution for traversing the DOM to the parent label
  // click could be on the 1st or 2nd level child
  let labelEl = clickedEl?.parentElement;
  if (!!labelEl && !(labelEl instanceof HTMLLabelElement)) {
    labelEl = labelEl?.parentElement;
  }
  if (!labelEl) {
    console.error('Cannot find parent label element of click');
    return;
  }
  labelEl.classList.toggle('selected');
  const topicId = labelEl.getAttribute('data-topic-id') as TopicId;
  if (!topicId) {
    console.error('Cannot find ID for topic', {labelEl});
    return;
  }
  setTopicDirty(topicId);
  labelEl.focus();
}

function formSubmit() {

}
