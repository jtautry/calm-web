// calm-web service worker

chrome.runtime.onInstalled.addListener(() => {
  // Set defaults on install
  chrome.storage.sync.set({
    'calm-web-enabled': true,
    allowlist: [
      'docs.google.com',
      'sheets.google.com',
      'slides.google.com',
      'figma.com',
      'github.com',
      'notion.so',
      'linear.app',
    ],
  })
})
