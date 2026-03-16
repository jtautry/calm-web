// calm-web popup

const globalToggle = document.getElementById('global-toggle') as HTMLInputElement
const siteToggle = document.getElementById('site-toggle') as HTMLInputElement
const siteLabel = document.getElementById('site-hostname') as HTMLSpanElement
const siteSection = document.getElementById('site-section') as HTMLDivElement

let currentHostname = ''
let sites: Record<string, boolean> = {}

function updateSiteSectionOpacity(globalEnabled: boolean): void {
  siteSection.style.opacity = globalEnabled ? '1' : '0.4'
  siteSection.style.pointerEvents = globalEnabled ? '' : 'none'
}

// Query active tab for hostname
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const tab = tabs[0]
  if (tab?.url) {
    try {
      currentHostname = new URL(tab.url).hostname
    } catch {
      currentHostname = ''
    }
  }

  // Truncate long hostnames for display
  const displayName = currentHostname.length > 30
    ? currentHostname.slice(0, 28) + '…'
    : currentHostname

  siteLabel.textContent = displayName || 'this site'

  // Load storage
  chrome.storage.sync.get(['enabled', 'sites'], result => {
    const globalEnabled = result['enabled'] !== false
    sites = result['sites'] ?? {}
    const siteEnabled = currentHostname ? sites[currentHostname] !== false : true

    globalToggle.checked = globalEnabled
    siteToggle.checked = siteEnabled

    updateSiteSectionOpacity(globalEnabled)
  })
})

// Global toggle handler
globalToggle.addEventListener('change', () => {
  const enabled = globalToggle.checked
  chrome.storage.sync.set({ enabled })
  updateSiteSectionOpacity(enabled)
})

// Site toggle handler
siteToggle.addEventListener('change', () => {
  if (!currentHostname) return
  const enabled = siteToggle.checked

  if (enabled) {
    // Remove from sites map (default is enabled)
    delete sites[currentHostname]
  } else {
    sites[currentHostname] = false
  }

  chrome.storage.sync.set({ sites })

  // Notify background to forward to content script
  chrome.runtime.sendMessage({ type: 'set-site', hostname: currentHostname, enabled })
})
