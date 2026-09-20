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
]

export default function AboutPage() {
  return (
    <section>
      <div className="page-head">
        <div>
          <h1>About</h1>
          <p className="page-head__sub">SE411 &mdash; Software Engineering Project, Part 1</p>
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
          In this first part the inventory is held entirely in memory as a collection of JavaScript objects &mdash;
          there is no database and no backend. The data layer sits behind a small context API so that Part 2 can
          replace it with a real REST backend without touching the components.
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
            <dd>Project Part 1 &mdash; React frontend</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
