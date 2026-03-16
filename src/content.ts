// calm-web content script — injected at document_start
// CSS is injected via manifest; this handles JS-driven distractions

const CALM_STORAGE_KEY = 'calm-web-enabled'

function pauseMediaElements(root: Document | Element = document): void {
  const media = root.querySelectorAll<HTMLMediaElement>('video, audio')
  media.forEach(el => {
    el.autoplay = false
    el.pause()
    el.preload = 'none'
  })
}

function freezeGifs(root: Document | Element = document): void {
  const imgs = root.querySelectorAll<HTMLImageElement>('img')
  imgs.forEach(img => {
    if (!img.complete || img.naturalWidth === 0) return
    const src = img.src.toLowerCase()
    if (!src.endsWith('.gif') && !src.includes('.gif?')) return

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0)
    img.src = canvas.toDataURL('image/png')
  })
}

function blockNotificationPrompts(): void {
  // Silently deny notification permission requests
  if ('Notification' in window) {
    Object.defineProperty(Notification, 'permission', {
      get: () => 'denied',
    })
    Notification.requestPermission = () => Promise.resolve('denied' as NotificationPermission)
  }
}

function applyCalm(root: Document | Element = document): void {
  pauseMediaElements(root)
  if (root === document) {
    freezeGifs(root)
    blockNotificationPrompts()
  }
}

// Watch for dynamically injected content
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof Element) {
        applyCalm(node)
      }
    }
  }
})

// Check if calm-web is enabled for this site
chrome.storage.sync.get([CALM_STORAGE_KEY, 'allowlist'], result => {
  const enabled = result[CALM_STORAGE_KEY] !== false
  const allowlist: string[] = result['allowlist'] ?? [
    'docs.google.com',
    'sheets.google.com',
    'slides.google.com',
    'figma.com',
    'github.com',
    'notion.so',
    'linear.app',
  ]

  const hostname = window.location.hostname
  if (!enabled || allowlist.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
    return
  }

  applyCalm()
  observer.observe(document, { childList: true, subtree: true })
})
