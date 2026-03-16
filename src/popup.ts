const CALM_STORAGE_KEY = 'calm-web-enabled'

const enabledToggle = document.getElementById('enabled') as HTMLInputElement
const allowlistEl = document.getElementById('allowlist') as HTMLDivElement
const newDomainInput = document.getElementById('new-domain') as HTMLInputElement
const addBtn = document.getElementById('add-btn') as HTMLButtonElement

let allowlist: string[] = []

function renderAllowlist(): void {
  allowlistEl.innerHTML = ''
  allowlist.forEach(domain => {
    const row = document.createElement('div')
    row.className = 'domain-row'
    row.innerHTML = `
      <span class="domain">${domain}</span>
      <button class="remove" data-domain="${domain}" title="Remove">×</button>
    `
    row.querySelector('.remove')?.addEventListener('click', () => removeDomain(domain))
    allowlistEl.appendChild(row)
  })
}

function removeDomain(domain: string): void {
  allowlist = allowlist.filter(d => d !== domain)
  chrome.storage.sync.set({ allowlist })
  renderAllowlist()
}

function addDomain(domain: string): void {
  domain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  if (!domain || allowlist.includes(domain)) return
  allowlist.push(domain)
  chrome.storage.sync.set({ allowlist })
  renderAllowlist()
  newDomainInput.value = ''
}

// Load state
chrome.storage.sync.get([CALM_STORAGE_KEY, 'allowlist'], result => {
  enabledToggle.checked = result[CALM_STORAGE_KEY] !== false
  allowlist = result['allowlist'] ?? []
  renderAllowlist()
})

// Toggle handler
enabledToggle.addEventListener('change', () => {
  chrome.storage.sync.set({ [CALM_STORAGE_KEY]: enabledToggle.checked })
})

// Add domain handler
addBtn.addEventListener('click', () => addDomain(newDomainInput.value))
newDomainInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addDomain(newDomainInput.value)
})
