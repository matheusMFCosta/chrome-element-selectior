chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js'],
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'CAPTURE_VISIBLE_TAB') {
    return;
  }

  chrome.tabs
    .captureVisibleTab(undefined, { format: 'png' })
    .then((dataUrl) => {
      sendResponse({ ok: true, dataUrl });
    })
    .catch((err) => {
      sendResponse({ ok: false, error: err?.message || String(err) });
    });

  return true;
});
