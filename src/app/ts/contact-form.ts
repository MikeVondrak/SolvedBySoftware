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

const sbsAPI = "https://solvedbysoftwareco2-dev-ed.develop.my.salesforce-sites.com/services/apexrest/ContactFormEntryREST"

type TopicId = keyof typeof TopicIds;
type InputId = keyof typeof InputIds;

// Convert enum to array for creating map
const topicArray: TopicId[] = Object.keys(TopicIds).map(topic => topic as TopicId);
const inputArray: InputId[] = Object.keys(InputIds).map(input => input as InputId);

// Initialize all inputs in the checkbox group to clean
let topicTouched: Map<TopicId, boolean> = new Map(topicArray.map(topic => [topic as TopicId, false]));
let inputTouched: Map<InputId, boolean> = new Map(inputArray.map(input => [input as InputId, false]));

let formSubmitted: boolean = false;

const contactUsHeaderSelector = "ContactUsHeader";
const formSelector = 'ContactUs';
const labelSelector = 'label';
const checkboxSelector = 'input[type="checkbox"]';
const inputTextSelector = 'input[type="text"]';
const inputEmailSelector = 'input[type="email"]';
const topicFiedsetSelector = 'TopicFieldset';
const topicOtherTextareaSelector = 'OtherTopic';
const topicOtherCheckmarkSelector = 'OtherTopicCheckmark';
const recaptchaSelector = 'Grecaptcha';
const formSubmitSelector = 'SubmitInquiry';
const schedulingSectionSelector = "Scheduling";
const schedulingSectionHeaderText = "Thank you for your interest!"

let formEl: HTMLElement;
let contactUsHeader: HTMLElement;
let topicFieldset: HTMLFieldSetElement;
let labels: NodeListOf<HTMLElement>;
let checkInputs: NodeListOf<HTMLElement>;
let textInputs: NodeListOf<HTMLElement>;
let emailInputs: NodeListOf<HTMLElement>;
let recaptcha: HTMLElement;
let submitInput: HTMLElement;
let schedulingSection: HTMLElement;
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

  if (!initializeGrecaptcha()) {
    console.error('Failed initializing reCAPTCHA');
  }
}
/**
 * Get DOM elements and attach event listeners
 * @returns true if successful
 */
function initializeElements(): boolean {
  // Contact section header
  contactUsHeader = document.getElementById(contactUsHeaderSelector) as HTMLElement;
  if (!contactUsHeader) {
    console.error('Contact section header not found');
    return false;
  }
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
  // Get recaptcha container div
  recaptcha = document.getElementById(recaptchaSelector) as HTMLElement;
  if (!recaptcha) {
    console.error('reCAPTCHA not found');
    return false;
  }
  // Get submit input
  submitInput = document.getElementById(formSubmitSelector) as HTMLInputElement;
  if (!submitInput) {
    console.error('Submit input not found');
    return false;
  }
  // Get Calendly link section
  schedulingSection = document.getElementById(schedulingSectionSelector) as HTMLInputElement;
  if (!schedulingSection) {
    console.error('Scheduling section not found');
    return false;
  }
  // Scheduling section is only shown after submitting form
  schedulingSection.style.display = "none";
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
  otherText.addEventListener('input', ($event) => textareaInput($event));
  otherText.addEventListener('blur', ($event) => topicBlur($event));
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
  nameInput.addEventListener('input', ($event) => inputTextInput($event));
  nameInput.addEventListener('change', ($event) => inputTextChange($event));
  nameInput.addEventListener('blur', ($event) => inputTextBlur($event));
  nameInput.addEventListener('invalid', ($event) => inputTextInvalid($event));
  
  emailInput.addEventListener('input', ($event) => inputTextInput($event));
  emailInput.addEventListener('change', ($event) => inputTextChange($event));
  emailInput.addEventListener('blur', ($event) => inputTextBlur($event));
  emailInput.addEventListener('invalid', ($event) => inputTextInvalid($event));

  // Override the form submit so we can do custom validation 
  formEl.addEventListener('submit', handleSubmit);

  // Report success
  return true;
}
/**
 * Initialize reCAPTCHA programatically
 */
function initializeGrecaptcha(): boolean {
  document.querySelector('body')?.addEventListener('grecaptchaLoadedCallback', () => grecaptchaLoaded());
  return true;
}
/**
 * 
 */
function grecaptchaLoaded() {
  const params: ReCaptchaV2.Parameters = {
    size: 'compact',
    sitekey: "6LemICsqAAAAAChnyBrAyJTIcfeFeA8Dw43Xo5j0",
    callback: grecaptchaSuccess,
    'error-callback': grecaptchaFail,
    'expired-callback': grecaptchaExpired,
  };
  grecaptcha.render(recaptcha, params);
}
/**
 * 
 */
function grecaptchaSuccess() {
  recaptcha.classList.remove('invalid');
  recaptcha.classList.add('valid');
  formValidate();
}
/**
 * 
 */
function grecaptchaFail() {
  recaptcha.classList.add('invalid');
  recaptcha.classList.remove('valid');
  formValidate();
}
/**
 * 
 */
function grecaptchaExpired() {
  recaptcha.classList.add('invalid');
  recaptcha.classList.remove('valid');
  formValidate();
}
/**
 * 
 */
function grecaptchaValidate(): boolean {
  const captchaValid = !!grecaptcha.getResponse();
  recaptcha.classList.toggle('invalid', !captchaValid);
  recaptcha.classList.toggle('valid', captchaValid);
  return captchaValid;
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

  if (inputTouched.get(inputId) && !uiEl.classList.contains('touched')) { 
    uiEl.classList.add('touched');
    if (!inputTouched.get(inputId)) {
      inputTouched.set(inputId, true);
    }
  }
  formValidate();
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
  setInputTouched(textId, text);
}
/**
 * Update state on attempt to submit form with invalid input
 * 
 * @param $event 
 */
function inputTextInvalid($event: Event) {
  //debugger;
  //inputTextsValidate();
}
/**
 * When value for a textbox changes
 * @param $event 
 */
function inputTextInput($event: Event) {
  const el = $event.target as HTMLInputElement;
  el.classList.toggle('invalid', !el.checkValidity());
  el.classList.toggle('valid', el.checkValidity());
  el.parentElement?.classList.toggle('invalid', !el.checkValidity());
  el.parentElement?.classList.toggle('valid', el.checkValidity());
}
/**
 * Check all non-Topic input fields for values
 * @returns All inputs valid
 */
function inputTextsValidate(): boolean {
  const texts = Array.from(textInputs) as HTMLInputElement[];
  const emails = Array.from(emailInputs) as HTMLInputElement[];
  const inputs = [...texts, ...emails];

  inputs.forEach(input => {
    input.classList.toggle('invalid', !input.checkValidity());
    input.classList.toggle('valid', input.checkValidity());
  });

  return !inputs.some((input) => !input.checkValidity());
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
  //fieldsetTopicsValidate();
  formValidate();
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
  return anyTouched;
}
/**
 * Get if any topic is checked
 * @returns If any topic checkboxes are currently selected
 */
function getTopicSelectedAny(): boolean {
  const inputs = Array.from(checkInputs);
  if (!inputs) {
    console.error('Could not get topics array');
  }
  const anyChecked = inputs.some(input => (input as HTMLInputElement)?.checked);
  return anyChecked;
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
  if (!topicTouched.get(topicId)) {
    uiEl.classList.add('touched');
    topicTouched.set(topicId, true);
  }
  formValidate();
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
    fieldsetTopicsValidate(); // TODO: reorganize formValidate to not need this call
    formValidate();
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
 * Update the style of the fieldset to reflect validity
 * @param $event 
 */
function fieldsetTopicsValidate(): boolean {
  // Set whether the set of checkboxes is in/valid 
  const topicSelected = getTopicSelectedAny();
  topicFieldset.classList.toggle('valid', topicSelected);
  topicFieldset.classList.toggle('invalid', !topicSelected);
  return topicSelected;
}
/**
 * Validate all form controls
 */
function formValidate(): boolean {
  let formValid = true;
  if (!formSubmitted) {
    // Don't show validation until first form submit
    return formValid;
  }
  formValid = fieldsetTopicsValidate();
  formValid = inputTextsValidate() && formValid;
  formValid = grecaptchaValidate() && formValid;

  updateSubmit(formValid);
  return formValid;
}
/**
 * Change the style of the "Send" button based on form validity
 * @param formValid 
 */
function updateSubmit(formValid: boolean) {
  submitInput.classList.add('touched');
  submitInput.classList.toggle('invalid', !formValid);
  submitInput.classList.toggle('valid', formValid);
  // TODO - make this less brittle, relies on markup structure to match
  // Add touched class to parent to show red box-shadow (can't be applied to pseudo-element)
  submitInput.parentElement?.classList.add('touched');
  submitInput.parentElement?.classList.toggle('invalid', !formValid);
  submitInput.parentElement?.classList.toggle('valid', formValid);
}
/**
 * Handle form submission asynchronously
 * @param $event Submit event from form
 */
function handleSubmit($event: SubmitEvent | Event) {
  formSubmitted = true;
  // Prevent native control response
  $event.preventDefault();
  $event.stopPropagation();

  let valid = formValidate();
  if (!valid) {
    // For invalid form do nothing, validation styles set by formValidate()
    return;
  }
  // Submit form via AJAX
  submitHttpRequest();
}
/**
 * Send the Contact form data to the API
 */
function submitHttpRequest() {
  const xhttp = new XMLHttpRequest();
  const data = getRequestBody();
  xhttp.onload = handleHttpResonse;
  xhttp.onerror = handleHttpError;
  xhttp.open("POST", sbsAPI, true);
  xhttp.setRequestHeader('Content-Type', 'json');
  xhttp.setRequestHeader('Access-Control-Allow-Origin', '*'); // TODO - SET CORRECT VALUE AFTER TESTING
  xhttp.setRequestHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  xhttp.setRequestHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); 
  xhttp.send(JSON.stringify(data));  
}
/**
 * 
 */
function handleHttpError(progressEvent: ProgressEvent) {
 console.log('ERROR', {progressEvent})
}
/**
 * 
 */
function handleHttpResonse(progressEvent: ProgressEvent) {
  console.log('RESPONSE', {progressEvent});
  contactUsHeader.innerText = schedulingSectionHeaderText;
  schedulingSection.style.display = "block";
  formEl.style.display = "none";
}
/**
 * 
 */
function getRequestBody() {
  const form = formEl as HTMLFormElement;
  const data = new FormData(form);
  const json = {    
    name: data.get('Name'),
    email: data.get('Email'),
    topics: data.getAll('Topics'),
  }
  return json;
}
/**
 * Helper function for existence
 * @param val 
 * @returns If val is null or undefined
 */
function nullOrUndefined(val: any) {
  return !(val !== undefined && val !== null);
}
