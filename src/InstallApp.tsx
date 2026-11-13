import { useEffect, useState } from 'react'
import { Download, Smartphone } from 'lucide-react'

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let pendingPrompt: InstallPromptEvent | null = null
const promptListeners = new Set<() => void>()

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault()
  pendingPrompt = event as InstallPromptEvent
  promptListeners.forEach(listener => listener())
})

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && navigator.standalone === true)
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export default function InstallApp() {
  const [installed, setInstalled] = useState(isStandalone)
  const [available, setAvailable] = useState(Boolean(pendingPrompt))
  const [showInstructions, setShowInstructions] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const display = window.matchMedia('(display-mode: standalone)')
    const updateDisplay = () => setInstalled(isStandalone())
    const updatePrompt = () => setAvailable(Boolean(pendingPrompt))
    const onInstalled = () => {
      pendingPrompt = null
      updatePrompt()
      setInstalled(true)
    }
    promptListeners.add(updatePrompt)
    window.addEventListener('appinstalled', onInstalled)
    display.addEventListener('change', updateDisplay)
    updateDisplay()
    updatePrompt()
    return () => {
      promptListeners.delete(updatePrompt)
      window.removeEventListener('appinstalled', onInstalled)
      display.removeEventListener('change', updateDisplay)
    }
  }, [])

  async function install() {
    setError('')
    const prompt = pendingPrompt
    if (!prompt) {
      setShowInstructions(value => !value)
      return
    }
    pendingPrompt = null
    setAvailable(false)
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'dismissed') setShowInstructions(true)
    } catch (reason) {
      setError(`Could not open the install prompt: ${reason instanceof Error ? reason.message : String(reason)}. Use your browser's install menu instead.`)
      setShowInstructions(true)
    }
  }

  if (installed) return null

  return (
    <section className="install-card" aria-label="Install Paint Keeper">
      <div className="install-icon"><Smartphone size={20} /></div>
      <div className="install-copy">
        <strong>Take your paints with you</strong>
        <p>Install Paint Keeper on your home screen for quick access.</p>
        <p>Guest data may not transfer between the browser and the installed app. Sign in to sync your collection across both.</p>
        <div id="install-instructions" className="install-instructions" hidden={!showInstructions}>
          {isIOS()
            ? <>On iPhone or iPad, open this page in Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</>
            : <>Open your browser menu and look for <strong>Install app</strong> or <strong>Add to Home screen</strong>. The wording depends on your browser.</>}
        </div>
        {error && <p className="install-error" role="alert">{error}</p>}
      </div>
      <button type="button" className="button secondary install-button" onClick={() => void install()} aria-expanded={showInstructions} aria-controls="install-instructions">
        <Download size={16} /> {available ? 'Install app' : showInstructions ? 'Hide instructions' : 'How to install'}
      </button>
    </section>
  )
}
