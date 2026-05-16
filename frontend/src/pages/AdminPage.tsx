import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/useRedux'
import { fetchEmployees, createEmployee, updateEmployee, deactivateEmployee, clearEmployeeMessages } from '../features/employeeSlice'
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
import { Plus, User, Mail, Calendar, Pencil, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { Employee } from '../types/rootTypes'

const createEmployeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  name: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const editEmployeeSchema = z.object({
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

type CreateEmployeeForm = z.infer<typeof createEmployeeSchema>
type EditEmployeeForm = z.infer<typeof editEmployeeSchema>

export default function AdminPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { employees, loading, error, successMessage } = useAppSelector((state) => state.employee)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const createForm = useForm<CreateEmployeeForm>({
    resolver: zodResolver(createEmployeeSchema),
  })

  const editForm = useForm<EditEmployeeForm>({
    resolver: zodResolver(editEmployeeSchema),
  })

  useEffect(() => {
    dispatch(fetchEmployees())
  }, [dispatch])

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage)
      const timer = setTimeout(() => {
        dispatch(clearEmployeeMessages())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      const timer = setTimeout(() => {
        dispatch(clearEmployeeMessages())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  // Check if user is admin
  if (user?.role !== 'admin') {
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

  const onCreateSubmit = async (data: CreateEmployeeForm) => {
    const { confirmPassword: _confirmPassword, ...employeeData } = data
    const result = await dispatch(createEmployee(employeeData))
    if (createEmployee.fulfilled.match(result)) {
      setIsCreateDialogOpen(false)
      createForm.reset()
    }
  }

  const onEditSubmit = async (data: EditEmployeeForm) => {
    if (!selectedEmployee) return
    const { confirmPassword: _confirmPassword, ...updateData } = data
    const result = await dispatch(updateEmployee({ userId: selectedEmployee._id, data: updateData }))
    if (updateEmployee.fulfilled.match(result)) {
      setIsEditDialogOpen(false)
      setSelectedEmployee(null)
      editForm.reset()
    }
  }

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    editForm.reset({
      email: employee.email,
      name: employee.name || '',
      password: '',
      confirmPassword: '',
    })
    setIsEditDialogOpen(true)
  }

  const handleDeactivate = async () => {
    if (!selectedEmployee) return
    const result = await dispatch(deactivateEmployee(selectedEmployee._id))
    if (deactivateEmployee.fulfilled.match(result)) {
      setIsDeactivateDialogOpen(false)
      setSelectedEmployee(null)
    }
  }

  const openDeactivateDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDeactivateDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
            <p className="text-gray-600">Manage your team's employees</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Employee</DialogTitle>
                <DialogDescription>
                  Add a new employee to your team.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="employee@company.com"
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
                    placeholder="Employee Name"
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
                    {loading ? 'Creating...' : 'Create Employee'}
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
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update employee details. Leave password blank to keep current password.
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
              <DialogTitle>Deactivate Employee</DialogTitle>
              <DialogDescription>
                Are you sure you want to deactivate this employee? They will no longer be able to access the system.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="font-medium">Email: {selectedEmployee?.email}</p>
              {selectedEmployee?.name && (
                <p className="text-gray-500">Name: {selectedEmployee.name}</p>
              )}
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
            <CardTitle>Team Employees</CardTitle>
            <CardDescription>
              List of all employees in your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && employees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Loading employees...</p>
            ) : employees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No employees found. Click "Add Employee" to create one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Name</TableHead>
                      <TableHead className="w-[200px]">Email</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[150px]">Created</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {employee.name || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {employee.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              employee.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {employee.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {employee.created_at
                              ? new Date(employee.created_at).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(employee)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeactivateDialog(employee)}
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