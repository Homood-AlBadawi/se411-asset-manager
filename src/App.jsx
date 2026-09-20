import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import AssetsPage from './pages/AssetsPage'
import AddAssetPage from './pages/AddAssetPage'
import EditAssetPage from './pages/EditAssetPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'

/** Shell: persistent menu, routed page body, footer. */
export default function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="app__main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/assets/new" element={<AddAssetPage />} />
          <Route path="/assets/:id/edit" element={<EditAssetPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="app__footer">
        <p>SE411 Project Part 1 &middot; Prince Sultan University &middot; Homood AlBadawi &amp; Malik Tariq</p>
      </footer>
    </div>
  )
}
