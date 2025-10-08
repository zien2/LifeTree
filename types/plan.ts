export interface Plan {
  id: string
  userId: string
  title: string
  description?: string
  priority: string
  status: string
  startDate?: string
  dueDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}
