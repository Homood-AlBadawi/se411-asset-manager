import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="empty">
      <h1>Page not found</h1>
      <p>That address does not match any page in the application.</p>
      <Link className="btn btn--primary" to="/">Back to dashboard</Link>
    </section>
  )
}
