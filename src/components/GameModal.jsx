import { useEffect } from 'react'

export function GameModal({ title, onClose, children, className = '' }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose()
    }}>
      <section className={`game-modal ${className}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header>
          <h2 id="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="ปิดหน้าต่าง">×</button>
        </header>
        <div className="modal-content">{children}</div>
      </section>
    </div>
  )
}
