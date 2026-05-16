import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/useRedux'
import { fetchAdmins, createAdmin, updateAdmin, deactivateAdmin, clearAdminMessages } from '../features/adminSlice'
import Header from '../components/Header'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, User, Mail, Calendar, Pencil, Trash2 } from 'lucide-react'
import type { Admin } from '../types/rootTypes'

const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  name: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const editAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword
  }
  return true
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type CreateAdminForm = z.infer<typeof createAdminSchema>
type EditAdminForm = z.infer<typeof editAdminSchema>

export default function SuperAdminPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { admins, loading, error, successMessage } = useAppSelector((state) => state.admin)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)

  const createForm = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
  })

  const editForm = useForm<EditAdminForm>({
    resolver: zodResolver(editAdminSchema),
  })

  useEffect(() => {
    dispatch(fetchAdmins())
  }, [dispatch])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearAdminMessages())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, dispatch])

  // Check if user is super_admin
  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onCreateSubmit = async (data: CreateAdminForm) => {
    const { confirmPassword: _confirmPassword, ...adminData } = data
    const result = await dispatch(createAdmin(adminData))
    if (createAdmin.fulfilled.match(result)) {
      setIsCreateDialogOpen(false)
      createForm.reset()
    }
  }

  const onEditSubmit = async (data: EditAdminForm) => {
    if (!selectedAdmin) return
    const { confirmPassword: _confirmPassword, ...updateData } = data
    const result = await dispatch(updateAdmin({ userId: selectedAdmin._id, data: updateData }))
    if (updateAdmin.fulfilled.match(result)) {
      setIsEditDialogOpen(false)
      setSelectedAdmin(null)
      editForm.reset()
    }
  }

  const openEditDialog = (admin: Admin) => {
    setSelectedAdmin(admin)
    editForm.reset({
      email: admin.email,
      name: admin.name || '',
      password: '',
      confirmPassword: '',
    })
    setIsEditDialogOpen(true)
  }

  const handleDeactivate = async () => {
    if (!selectedAdmin) return
    const result = await dispatch(deactivateAdmin(selectedAdmin._id))
    if (deactivateAdmin.fulfilled.match(result)) {
      setIsDeactivateDialogOpen(false)
      setSelectedAdmin(null)
    }
  }

  const openDeactivateDialog = (admin: Admin) => {
    setSelectedAdmin(admin)
    setIsDeactivateDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
            <p className="text-gray-600">Manage company administrators</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Add a new administrator to your company.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="admin@company.com"
                    {...createForm.register('email')}
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{createForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-name">Name (Optional)</Label>
                  <Input
                    id="create-name"
                    placeholder="Admin Name"
                    {...createForm.register('name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-password">Password</Label>
                  <Input
                    id="create-password"
                    type="password"
                    placeholder="Enter password"
                    {...createForm.register('password')}
                  />
                  {createForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{createForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-confirmPassword">Confirm Password</Label>
                  <Input
                    id="create-confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    {...createForm.register('confirmPassword')}
                  />
                  {createForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{createForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Admin'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Admin</DialogTitle>
              <DialogDescription>
                Update admin details. Leave password blank to keep current password.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...editForm.register('email')}
                />
                {editForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{editForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Name (Optional)</Label>
                <Input
                  id="edit-name"
                  {...editForm.register('name')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (Optional)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Leave blank to keep current"
                  {...editForm.register('password')}
                />
                {editForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{editForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
                <Input
                  id="edit-confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  {...editForm.register('confirmPassword')}
                />
                {editForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{editForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Deactivate Confirmation Dialog */}
        <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate Admin</DialogTitle>
              <DialogDescription>
                Are you sure you want to deactivate this admin? They will no longer be able to access the system.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="font-medium">Email: {selectedAdmin?.email}</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDeactivateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeactivate} disabled={loading}>
                {loading ? 'Deactivating...' : 'Deactivate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Company Admins</CardTitle>
            <CardDescription>
              List of all administrators in your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && admins.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Loading admins...</p>
            ) : admins.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No admins found. Click "Add Admin" to create one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Email</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[150px]">Created</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {admin.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              admin.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {admin.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {admin.created_at
                              ? new Date(admin.created_at).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(admin)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeactivateDialog(admin)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}