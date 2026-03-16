// calm-web content script — injected at document_start

const hostname = window.location.hostname

function pauseMedia(root: Document | Element): void {
  const media = root.querySelectorAll<HTMLMediaElement>('video, audio')
  media.forEach(el => {
    el.autoplay = false
    el.pause()
    el.preload = 'none'
  })
}

function freezeGifs(root: Document | Element): void {
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

function blockNotifications(): void {
  if ('Notification' in window) {
    Object.defineProperty(Notification, 'permission', {
      get: () => 'denied',
    })
    Notification.requestPermission = () => Promise.resolve('denied' as NotificationPermission)
  }
}

let observer: MutationObserver | null = null

function startObserver(): void {
  if (observer) return
  observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) {
          pauseMedia(node)
          freezeGifs(node)
        }
      }
    }
  })
  observer.observe(document, { childList: true, subtree: true })
}

function stopObserver(): void {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

function activate(): void {
  document.documentElement.classList.add('calm-web-active')
  pauseMedia(document)
  freezeGifs(document)
  blockNotifications()
  startObserver()
}

function deactivate(): void {
  document.documentElement.classList.remove('calm-web-active')
  stopObserver()
}

// Listen for toggle messages from background (sent when popup changes site toggle)
chrome.runtime.onMessage.addListener((message: { type: string; enabled: boolean }) => {
  if (message.type === 'calm-toggle') {
    if (message.enabled) {
      activate()
    } else {
      deactivate()
    }
  }
})

// Initial load: check global + per-site settings
chrome.storage.sync.get(['enabled', 'sites'], result => {
  const globalEnabled = result['enabled'] !== false
  const sites: Record<string, boolean> = result['sites'] ?? {}

  if (!globalEnabled || sites[hostname] === false) {
    return
  }

  activate()
})
