import { NavLink } from 'react-router-dom'

/**
 * Primary navigation. Requirement 2 of the brief: a menu that lets the user
 * reach every feature, including the About page.
 */
const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/assets', label: 'Assets' },
  { to: '/assets/new', label: 'Add Asset' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" end>
          <span className="navbar__logo" aria-hidden="true">AT</span>
          <span>
            <strong>AssetTrack</strong>
            <small>IT Asset Management</small>
          </span>
        </NavLink>

        <nav aria-label="Main navigation">
          <ul className="navbar__links">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => (isActive ? 'navbar__link navbar__link--active' : 'navbar__link')}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
