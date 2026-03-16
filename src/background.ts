// calm-web service worker

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enabled: true, sites: {} })
})

// Listen for site-toggle messages from popup
chrome.runtime.onMessage.addListener(
  (message: { type: string; hostname: string; enabled: boolean }, _sender, sendResponse) => {
    if (message.type === 'set-site') {
      // Forward to the active tab's content script
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0]
        if (tab?.id != null) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'calm-toggle',
            enabled: message.enabled,
          })
        }
      })
      sendResponse({})
    }
    return false
  }
)
