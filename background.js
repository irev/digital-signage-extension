/* global chrome */
import { get, Store } from './idb-keyval.mjs';
chrome.action.onClicked.addListener(startExt);
chrome.runtime.onUpdateAvailable.addListener(handleUpdate);
// chrome.runtime.onInstalled.addListener(startExt);
chrome.runtime.onStartup.addListener(handleStartup);
chrome.runtime.onMessage.addListener(handleMessage);



let windowsId = null;
let urlLink = 'http://localhost/digital-signage/';
async function startExt(setUrl) {
  // opens a window with the player
  // focuses on the existing window if it exists
  if (windowsId !== null) {
    try {
      await focusWindow();
      return;
    } catch (e) {
      console.log('The player window is closed, so creating a new one');
    }
  }

  createWindow(setUrl);
  if (chrome.power) {
    chrome.power.requestKeepAwake('display');
  }
}

// returns a Promise which is rejected on failure
function focusWindow() {
  return new Promise((resolve, reject) => {
    chrome.windows.update(windowsId, { focused: true }, () => {
      chrome.runtime.lastError ? reject() : resolve()
    });
  })
}


async function createWindow(setUrl) {
  chrome.windows.create(
    {
      url: setUrl,
      type: 'popup',
      focused: true,
      state: await isFullscreen() ? 'fullscreen' : 'normal',
    },
    onWindowCreated
  );
}

async function onWindowCreated({ id }) {
  windowsId = id;
  startSyncingWindowFullscreenState({ id });
}

// normally the web player changes fullscreen mode via HTML5
// but for the extension we need to use the Chrome API because HTML5 API doesn't work without a user gesture
let intervalId = 0;
function startSyncingWindowFullscreenState({ id }) {
  // not setting an initial value so the updater runs at least once
  // because initial 'fullscreen' state doesn't work on MacOS
  let isFullscreenG;

  clearInterval(intervalId);
  intervalId = setInterval(
    async () => {
      const isFullscreen_ = await isFullscreen();
      if (isFullscreenG !== isFullscreen_) {
        isFullscreenG = isFullscreen_;
        chrome.windows.update(id, { state: isFullscreenG ? 'fullscreen' : 'normal' });
      }
    },
    1000
  )
}

function log(msg) {
  console.log(`${ new Date().toISOString() }: ${ msg }`);
}

async function handleStartup() {
  const shouldStart = await isAutostart();
  log(`Startup detected. Should the app start: ${ shouldStart }`);
  if (shouldStart) {
    startExt(urlLink);
  }
}

async function isAutostart() {
  try {
    const db = new Store('pixelart-player-info', 'player-info');
    const isAutostart = await get('isAutostart', db);
    return isAutostart;
  } catch (e) {
    log(e);
    return false;
  }
}

async function isFullscreen() {
  try {
    const db = new Store('pixelart-player-info', 'player-info');
    const isFullscreen_ = await get('isFullscreen', db);
    return isFullscreen_;
  } catch (e) {
    log(e);
    return false;
  }
}

function handleUpdate() {
  log('Reloading because of an update');
  chrome.runtime.reload();
}
// using from popup with :  let getFuction =  chrome.runtime.sendMessage('start'); 
function handleMessage(request, sender, sendResponse) {
  if (request.msg === 'start') {
    if(request.link != ''){
      log('request.link :' + request.link);
      urlLink = request.link;
    }
    startExt(urlLink);
    
  }
}