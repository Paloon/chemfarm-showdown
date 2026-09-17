function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ChemFarm Showdown home">
          <span className="brand-mark" aria-hidden="true">
            CF
          </span>
          <span>ChemFarm</span>
        </a>

        <span className="status-pill">
          <span className="status-dot" aria-hidden="true" />
          Development ready
        </span>
      </header>

      <main id="top" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">React · Vite · ESLint</p>
          <h1>
            Grow ideas.
            <span> Test reactions.</span>
          </h1>
          <p className="hero-description">
            ChemFarm Showdown is set up and ready for the next experiment. Start
            building in <code>src/App.jsx</code> and see every change instantly.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="https://vite.dev/guide/" target="_blank" rel="noreferrer">
              Read the Vite guide
              <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href="https://react.dev/learn" target="_blank" rel="noreferrer">
              Explore React
            </a>
          </div>
        </div>

        <aside className="lab-card" aria-label="Project readiness">
          <div className="lab-card-header">
            <span>Lab status</span>
            <span className="lab-card-icon" aria-hidden="true">⌁</span>
          </div>

          <div className="score-ring" aria-label="100 percent ready">
            <div>
              <strong>100</strong>
              <span>% ready</span>
            </div>
          </div>

          <ul className="check-list">
            <li><span aria-hidden="true">✓</span> Fast development server</li>
            <li><span aria-hidden="true">✓</span> React Fast Refresh</li>
            <li><span aria-hidden="true">✓</span> Production build pipeline</li>
          </ul>
        </aside>
      </main>

      <footer>
        <span>CHEMFARM / 001</span>
        <span>Ready for cultivation</span>
      </footer>
    </div>
  )
}

export default App
