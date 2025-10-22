import { useAuth, useUser } from '@clerk/clerk-react'
import { Navigate, useLocation } from 'react-router-dom'
import Loading from './Loading'

const AdminRoute = ({ 
  children, 
  requiredRole = 'admin',
  redirectTo = '/sign-in' 
}) => {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const location = useLocation()

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return <Loading message="Loading..." />
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check if user has admin role
  const userRole = user?.publicMetadata?.role || user?.unsafeMetadata?.role
  const isAdmin = userRole === 'admin' || userRole === 'super_admin'

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the admin panel.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Homepage
            </button>
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default AdminRoute