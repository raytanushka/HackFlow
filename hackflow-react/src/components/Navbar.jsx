import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Auto-close the mobile panel if the viewport grows back to desktop width
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 880) setMenuOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const linkClass = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <svg className="mark" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2L6 16h8l-3 12L26 12h-9l1-10z" fill="#8b7bff" />
            <path d="M18 2L6 16h8l-3 12" stroke="#5b4fd6" strokeWidth="0.5" fill="none" opacity="0.5" />
          </svg>
          <span>
            Hack<span className="flow">Flow</span>
          </span>
        </Link>

        <nav className="links">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/available-hackathons" className={linkClass}>Hackathons</NavLink>
          <a href="#projects">Projects</a>
          <a href="#about">About</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="user-pill">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
            <span className="username">Demo User</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-panel" style={{ display: 'flex' }}>
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/available-hackathons" className={linkClass} onClick={() => setMenuOpen(false)}>Hackathons</NavLink>
          <a href="#projects" onClick={() => setMenuOpen(false)}>Projects</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        </div>
      )}
    </header>
  );
}
