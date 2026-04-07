import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CreatePortfolio from './pages/CreatePortfolio'
import PortfolioDetails from './pages/PortfolioDetails'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import DashboardEditPortfolio from './pages/DashboardEditPortfolio'

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <>
      {location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/admin/login' && <Navbar />}
      <main className="min-h-[calc(100vh-80px)]">{children}</main>
    </>
  )
}

function AppContent() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreatePortfolio />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portfolio/:id"
        element={
          <Layout>
            <PortfolioDetails />
          </Layout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreatePortfolio />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/edit/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardEditPortfolio />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
