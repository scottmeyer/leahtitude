'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Navigation } from '@/components/layout/navigation'
import { TaskForm } from '@/components/tasks/task-form'
import { TaskList } from '@/components/tasks/task-list'

export default function TasksPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTaskCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                <p className="text-muted-foreground">
                  Manage your tasks and stay organized.
                </p>
              </div>
              <TaskForm onTaskCreated={handleTaskCreated} />
            </div>

            {/* Task List */}
            <TaskList refreshTrigger={refreshTrigger} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}