import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icon'

// toasts, a confirm dialog and the cart drawer, available anywhere through useUi()
const UiContext = createContext(null)
export const useUi = () => useContext(UiContext)

let nextId = 1

export function UiProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [ask, setAsk] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((list) => list.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback((message, type = 'success') => {
    const id = nextId++
    setToasts((list) => [...list.slice(-3), { id, message, type }])
    timers.current.set(id, setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500))
  }, [dismiss])

  // confirm({ title, message, confirmLabel, danger }) resolves true or false
  const confirm = useCallback((options) => new Promise((resolve) => setAsk({ ...options, resolve })), [])
  const answer = (value) => { ask?.resolve(value); setAsk(null) }

  const value = useMemo(() => ({ toast, confirm, cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false) }), [toast, confirm, cartOpen])

  return (
    <UiContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className={`toast toast-${item.type}`}>
            <Icon name={item.type === 'error' ? 'alert' : 'check-circle'} size={20} />
            <span>{item.message}</span>
            <button type="button" className="toast-x" onClick={() => dismiss(item.id)} aria-label="Dismiss"><Icon name="x" size={16} /></button>
          </div>
        ))}
      </div>
      {ask && <ConfirmDialog ask={ask} onAnswer={answer} />}
    </UiContext.Provider>
  )
}

function ConfirmDialog({ ask, onAnswer }) {
  const cancel = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    cancel.current?.focus()
    const onKey = (event) => { if (event.key === 'Escape') onAnswer(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); previous?.focus?.() }
  }, [onAnswer])

  return (
    <div className="overlay center" onMouseDown={(event) => { if (event.target === event.currentTarget) onAnswer(false) }}>
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-text">
        <h2 id="dlg-title">{ask.title || 'Are you sure?'}</h2>
        <p id="dlg-text">{ask.message}</p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" ref={cancel} onClick={() => onAnswer(false)}>{ask.cancelLabel || 'Cancel'}</button>
          <button type="button" className={`btn ${ask.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => onAnswer(true)}>{ask.confirmLabel || 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}
