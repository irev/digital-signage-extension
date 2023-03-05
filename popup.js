
// combobok event action 
const comboBoxID =  document.getElementById('active');
const urlLink =  document.getElementById('url'); // value input link
// this message handled in the background script "chrome-extension-starter.js" //chrome.runtime.getBackgroundPage();

comboBoxID.addEventListener('change', async () => {
    if (comboBoxID.checked) {
        // Call Background Function startExt()
        chrome.runtime.sendMessage({"msg":'start',"link":urlLink.value}); 
        alert("Checkbox is checked.. "+urlLink.value);
        console.log("Checkbox is checked..",urlLink.value);
      } else {
        //alert("Checkbox is not checked..");
        console.log("Checkbox is not checked..");
      }
    const tab = await getCurrentTab();
    // const name = 'World';
    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     func: showAlert,
    //     args: [name]
    //   });
});




function showAlert(givenName) {
    alert(`Hello, ${givenName}`);
  }

async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }


  async function onError(error) {
    console.log(`Error: ${error}`);
  }