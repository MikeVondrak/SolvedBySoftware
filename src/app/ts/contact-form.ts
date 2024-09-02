enum TopicIds {
  APP_DEV = 'Application Development',
  DATA_MIG = 'Data Migration',
  LIGHTNING_MIG = 'Lightning Migration',
  SF_AUTO = 'Salesforce Automation',
  REPORTING = 'Reporting & Dashboards',
  THIRD_PARTY = 'Third-Party App Integration',
  OTHER = 'Other Topic',
}
enum InputIds {
  NAME = 'Name',
  EMAIL = 'Email'
}

type TopicId = keyof typeof TopicIds;
type InputId = keyof typeof InputIds;

// Convert enum to array for creating map
const topicArray: TopicId[] = Object.keys(TopicIds).map(topic => topic as TopicId);
const inputArray: InputId[] = Object.keys(InputIds).map(input => input as InputId);

// Initialize all inputs in the checkbox group to clean
let topicTouched: Map<TopicId, boolean> = new Map(topicArray.map(topic => [topic as TopicId, false]));
let inputTouched: Map<InputId, boolean> = new Map(inputArray.map(input => [input as InputId, false]));

const formSelector = 'ContactUs';
const labelSelector = 'label';
const checkboxSelector = 'input[type="checkbox"]';
const inputTextSelector = 'input[type="text"]';
const inputEmailSelector = 'input[type="email"]';
const topicFiedsetSelector = 'TopicFieldset';
const topicOtherTextareaSelector = 'OtherTopic';
const topicOtherCheckmarkSelector = 'OtherTopicCheckmark';
const formSubmitSelector = 'SubmitInquiry';
let formEl: HTMLElement;
let topicFieldset: HTMLFieldSetElement;
let labels: NodeListOf<HTMLElement>;
let checkInputs: NodeListOf<HTMLElement>;
let textInputs: NodeListOf<HTMLElement>;
let emailInputs: NodeListOf<HTMLElement>;
let submitInput: HTMLElement;
/**
 * Attach event handlers etc for form
 * @returns early on invalid condition
 */
export function initialize() {
  // Get all elements from DOM
  if (!initializeElements() || !formEl) {
    console.error('Failed getting elements', {formEl});
    return;
  }
  // Attach event listeners that drive UI states
  if (!addEventListeners()) {
    console.error('Failed attaching listeners');
    return;
  }
}
/**
 * Get DOM elements and attach event listeners
 * @returns true if successful
 */
function initializeElements(): boolean {
  // Get form element  
  const fEl = document.getElementById(formSelector);
  if (!fEl) {
    console.error('Form element not found');
    return false;
  }
  formEl = fEl;
  // Get the Topic FieldSet
  topicFieldset = document.getElementById(topicFiedsetSelector) as HTMLFieldSetElement;
  if (!topicFieldset) {
    console.error('Fieldset not found');
    return false;
  }
  // Get labels for Topic checkbox group
  labels = formEl.querySelectorAll(labelSelector);
  if (!labels) {
    console.error('Labels not found');
    return false;
  }
  // Get checkbox inputs
  checkInputs = formEl.querySelectorAll(checkboxSelector);
  if (!checkInputs || checkInputs.length <= 0) {
    console.error('Checkboxes not found');
    return false;
  }
  // Get name and email inputs
  textInputs = formEl.querySelectorAll(inputTextSelector);
  emailInputs = formEl.querySelectorAll(inputEmailSelector);
  if (!textInputs || textInputs.length <= 0 || !emailInputs || emailInputs.length <= 0) {
    console.error('Text/email inputs not found', {textInputs}, {emailInputs});
    return false;
  }
  inputTouched.set(textInputs.item(0).id as InputId, false);
  inputTouched.set(emailInputs.item(0).id as InputId, false);
  // Get submit input
  submitInput = document.getElementById(formSubmitSelector) as HTMLInputElement;
  if (!submitInput) {
    console.error('Contact form submit not found');
    return false;
  }
  return true;
}
/**
 * Attach event listeners for form UI elements
 * @returns true if successful
 */
function addEventListeners(): boolean {
  //
  // Topic Checkboxes
  //
  // Add a click event for each label
  labels.forEach((label) => {
    label.addEventListener('click', ($event) => topicClick($event));
  });
  // Add click and blur handlers for each checkbox
  checkInputs.forEach((checkbox) => {
    // Prevent the default click event on checkInputs so we can handle it from the parent label
    checkbox.addEventListener('click', ($event) => {
      $event.preventDefault();
      topicClick($event);
    });
    // Add a blur listener to mark the fieldset invalid if touched but none checked
    checkbox.addEventListener('blur', ($event: FocusEvent) => topicBlur($event));
  });
  // Set up validation for the "Other" topic option
  const otherText = document.getElementById(topicOtherTextareaSelector);
  if (!otherText) {
    console.error('Contact form other text not found');
    return false;
  }
  otherText.addEventListener('blur', ($event) => topicBlur($event));
  otherText.addEventListener('input', ($event) => textareaInput($event));
  //
  // Name and Email Text boxes
  //
  // Set up validation for Name and Email inputs
  // TODO: currently only 1 of each type, will need to change selector if more are added
  const nameInput = textInputs.item(0) as HTMLInputElement;
  const emailInput = emailInputs.item(0) as HTMLInputElement;
  if (!nameInput || !emailInput) {
    console.error('Could not find input: ', {nameInput}, {emailInput});
  }
  nameInput.addEventListener('change', ($event) => inputTextChange($event));
  nameInput.addEventListener('blur', ($event) => inputTextBlur($event));
  nameInput.addEventListener('invalid', ($event) => inputTextInvalid($event));
  nameInput.addEventListener('input', ($event) => inputTextInput($event));
  
  emailInput.addEventListener('change', ($event) => inputTextChange($event));
  emailInput.addEventListener('blur', ($event) => inputTextBlur($event));
  emailInput.addEventListener('invalid', ($event) => inputTextInvalid($event));
  emailInput.addEventListener('input', ($event) => inputTextInput($event));

  // Override the form submit so we can do custom validation 
  formEl.addEventListener('submit', handleSubmit);
  // Report success
  return true;
}
/**
 * Indicate the user interacted with a UI input
 * @param inputId ID of input touched
 * @param uiEl Elemnent to add 'touched' class to
 * @returns On invalid conditions
 */
function setInputTouched(inputId: InputId, uiEl: HTMLElement) {
  if (!inputId) {
    console.error('Cannot get ID of topic');
    return;
  }
  console.log('INPUT TOUCHED');
  uiEl.classList.add('touched');
  if (!inputTouched.get(inputId)) {
    console.log('SET INPUT TOUCHED', {inputId});
    inputTouched.set(inputId, true);
  }
}
/**
 * Handle UI changes for input into "Other" textarea
 * @param $event 
 * @returns on invalid condition
 */
function inputTextChange($event: Event) {
  const text = $event.target as HTMLInputElement;
  const id = text?.id as InputId;
  if (!text || nullOrUndefined(id)) {
    console.error('Could not get input or id', {text}, {id});
    return;
  }
  console.log('----- Input CHANGE', {id});
  setInputTouched(id, text);
}
/**
 * Handle UI changes when input loses focus
 * @param $event 
 * @returns on invalid condition
 */
function inputTextBlur($event: Event) {
  const text = $event.target as HTMLInputElement;
  if (!text || !text.id) {
    console.error('Could not get input');
    return;
  }
  const textId = text.id as InputId;
  if (inputTouched.get(textId) && !text.classList.contains('touched')) {
    console.log('---- TEXTBLUR', {textId});
    inputTouched.set(textId, true);
    text.classList.add('touched');
  }
}
/**
 * Update state on attempt to submit form with invalid input
 * @param $event 
 */
function inputTextInvalid($event: Event) {
  console.log('INVALID');
  handleSubmit($event);
}
/**
 * When value for a textbox changes
 * @param $event 
 */
function inputTextInput($event: Event) {
  const el = $event.target as HTMLInputElement;
  console.log('INPUT INPUT', {el});
}
/**
 * Update the style of the fieldset to reflect validity
 * @param $event 
 */
function topicFieldsetUpdate() {
  // Set whether the set of checkboxes is in/valid 
  const topicSelected = getTopicSelectedAny();
  topicFieldset.classList.toggle('valid', topicSelected);
  topicFieldset.classList.toggle('invalid', !topicSelected);
}
/**
 * Apply styles when topic is deselected
 * @param $event 
 */
function topicBlur($event: FocusEvent) {
  // If nothing has been touched nothing needs to be done
  if (!getTopicTouchedAny()) {
    return;
  }
  // A topic has been touched, so update fieldset validation styles
  topicFieldsetUpdate();
}
/**
 * Handle input changes for the Other topic option textarea
 * @param $event Input event
 * @returns On invalid conditions
 */
function textareaInput($event: Event) {
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
  const topicId: TopicId = otherText.getAttribute('data-input-id') as TopicId;
  const event: InputEvent = $event as InputEvent;
  if (!topicId || !event) {
    console.error('Cannot get topic ID / event of textbox', {topicId}, {event});
    return;
  }
  
  setTopicTouched(topicId, otherText);
}
/**
 * Check if any controls in the form have been touched
 * @returns True if any UI input from user in form
 */
function getTopicTouchedAny(): boolean {
  const anyTouched = Array.from(topicTouched.values()).includes(true); 
  console.log('ANY TOUCHED:', anyTouched, topicTouched.values());
  return anyTouched;
}
/**
 * Get if any topic is checked
 * @returns If any topic checkboxes are currently selected
 */
function getTopicSelectedAny(): boolean {
  return Array.from(checkInputs).some(check => (check as HTMLInputElement).checked);
}
/**
 * Indicate the user interacted with a UI element
 * @param topicId topic touched
 * @param uiEl elemnent to add 'touched' class to
 * @returns On invalid conditions
 */
function setTopicTouched(topicId: TopicId, uiEl: HTMLElement) {
  if (!topicId) {
    console.error('Cannot get ID of topic');
    return;
  }
  console.log('TOPIC TOUCHED');
  uiEl.classList.add('touched');
  if (!topicTouched.get(topicId)) {
    console.log('SET TOPIC TOUCHED');
    topicTouched.set(topicId, true);
  }
  topicFieldsetUpdate();
}
/**
 * Process click of radio button group
 * @param $event PointerEvent (checkbox) or MouseEvent (textarea)
 * @returns On invalid condition
 */
function topicClick($event: PointerEvent | MouseEvent) {
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
  if (!labelEl || !(labelEl instanceof HTMLLabelElement)) {
    console.error('Cannot find parent label element of click');
    return;
  }
  labelEl.classList.toggle('selected');
  // Get all the checkbox input elements
  const checkInputs = labelEl.getElementsByTagName('input');
  if (!checkInputs || checkInputs.length <= 0) {
    console.error('Cannot get checkbox child of label');
    return;
  }
  const checkboxInput = (checkInputs.item(0) as HTMLInputElement);
  // Wait a cycle to set the checked value in case the event is coming from the checkbox input
  // - avoids bug where clicking on the checkmark image does not select the checkmark
  setTimeout(() => {
    checkboxInput.checked = !checkboxInput.checked;
    if (getTopicSelectedAny()) {
      topicFieldset.classList.add('valid');
      topicFieldset.classList.remove('invalid');
    } else if(getTopicTouchedAny()) {
      topicFieldset.classList.remove('valid');
      topicFieldset.classList.add('invalid');
    }
  });
  
  const topicId = labelEl.getAttribute('data-input-id') as TopicId;
  if (!topicId) {
    console.error('Cannot find ID for topic', {labelEl});
    return;
  }
  setTopicTouched(topicId, labelEl);
  labelEl.focus();
}
/**
 * Handle form submission asynchronously
 * @param $event Submit event from form
 */
function handleSubmit($event: SubmitEvent | Event) {
  console.log('AAAAA');
  // Prevent native control response
  $event.preventDefault();
  $event.stopPropagation();
  
  // If nothing has been touched/selected
  if (!getTopicTouchedAny() || !getTopicSelectedAny()) {
    topicFieldsetUpdate();
  }

  submitInput.classList.add('touched');
  // TODO - make this less brittle, relies on markup structure to match
  submitInput.parentElement?.classList.add('touched');

  

  // TODO - logic
}
/**
 * Helper function for existence
 * @param val 
 * @returns If val is null or undefined
 */
function nullOrUndefined(val: any) {
  return !(val !== undefined && val !== null);
}