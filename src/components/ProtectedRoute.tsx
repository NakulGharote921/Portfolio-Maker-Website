import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

interface Props {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-base-300/60 bg-base-100/70 p-10 shadow-xl">
          <h1 className="text-3xl font-black">Admin access required</h1>
          <p className="mt-3 text-base-content/70">
            Your signed-in account does not have permission to open the dashboard.
          </p>
        </div>
      </section>
    )
  }

  return <>{children}</>
}
