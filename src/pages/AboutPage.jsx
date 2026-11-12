/**
 * Requirement 4 of the brief: an About page presenting the team, reachable from
 * the main menu.
 */

const TEAM = [
  { name: 'Homood AlBadawi', studentId: '221110514', role: 'Frontend architecture, state management, testing' },
  { name: 'Malik Tariq', studentId: '221110513', role: 'UI design, components, documentation' },
]

const STACK = [
  { name: 'React 18', note: 'Component model and hooks' },
  { name: 'Vite 5', note: 'Dev server and production build' },
  { name: 'React Router 6', note: 'Client-side routing for the menu' },
  { name: 'Vitest + React Testing Library', note: 'Unit and component tests' },
  { name: 'Plain CSS', note: 'Design tokens, no UI framework' },
  { name: 'Spring Boot 4.1 (Java 21)', note: 'REST API at /api/v1/assets' },
  { name: 'Spring Data JDBC + H2', note: 'Persistence with paging and sorting' },
  { name: 'JUnit 5 + Mockito', note: 'Backend unit and web-layer tests' },
]

export default function AboutPage() {
  return (
    <section>
      <div className="page-head">
        <div>
          <h1>About</h1>
          <p className="page-head__sub">SE411 &mdash; Software Engineering Project, Parts 1 &amp; 2</p>
        </div>
      </div>

      <div className="card">
        <h2>Team members</h2>
        <ul className="team">
          {TEAM.map((member) => (
            <li key={member.studentId} className="team__member">
              <span className="team__avatar" aria-hidden="true">
                {member.name.split(' ').map((part) => part[0]).join('')}
              </span>
              <span className="team__details">
                <strong>{member.name}</strong>
                <span className="team__id">Student ID: {member.studentId}</span>
                <span className="muted">{member.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>The project</h2>
        <p>
          <strong>AssetTrack</strong> is an IT asset management frontend. It lets an organisation record the
          computers, servers, network gear and peripherals it owns, and then add, update, delete, search and
          display them.
        </p>
        <p>
          The React frontend talks to a Spring Boot REST API, which stores the inventory in an H2 database
          through Spring Data JDBC. Listing is paginated on the server, assets can be looked up by ID, and the
          backend validates every write again &mdash; including tag uniqueness, which is enforced by the database.
        </p>

        <h3>Technology stack</h3>
        <ul className="stack">
          {STACK.map((item) => (
            <li key={item.name}>
              <strong>{item.name}</strong>
              <span className="muted"> &mdash; {item.note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Course information</h2>
        <dl className="meta-list">
          <div>
            <dt>Course</dt>
            <dd>SE411 &mdash; Fall 2026/27</dd>
          </div>
          <div>
            <dt>Instructor</dt>
            <dd>Dr. Skander Turki</dd>
          </div>
          <div>
            <dt>Institution</dt>
            <dd>Prince Sultan University</dd>
          </div>
          <div>
            <dt>Deliverable</dt>
            <dd>Project Parts 1 &amp; 2 &mdash; React frontend + Spring backend</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
