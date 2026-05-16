import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import Header from '../components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Welcome back! Here's your overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">0</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>Account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}