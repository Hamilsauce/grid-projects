const startPrompt = document.querySelector('#start-prompt');
const resultCountEl = document.querySelector('#result-count');
const bodyContent = document.querySelector('#body-content');
const filterForCountCheckbox = document.querySelector('#filter-checkbox');
const filterByTimestampsCheckbox = document.querySelector('#filter-for-close-timestamps');
const msInput = document.querySelector('#ms-input');
const filePicker = document.querySelector('#file-picker');
const uploadButton = document.querySelector('#file-picker-button');


const copyTextToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};

export const handleFilePick = (e) => {
  const file = e.target.files[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      run(json);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };
  
  reader.onerror = () => {
    console.error("File could not be read:", reader.error);
  };
  
  reader.readAsText(file);
};

/*
  Event Listeners
*/

uploadButton.addEventListener('click', (e) => {
  filePicker.click();
});

filePicker.addEventListener('change', handleFilePick, false);