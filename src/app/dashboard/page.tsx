'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Navigation } from '@/components/layout/navigation'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { TaskForm } from '@/components/tasks/task-form'
import { ProjectForm } from '@/components/projects/project-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckSquare, FolderKanban, Plus } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalTasks: number
  completedTasks: number
  activeTasks: number
  totalProjects: number
  activeProjects: number
  completedProjects: number
}

interface Activity {
  id: string
  type: 'task_created' | 'task_completed' | 'project_created' | 'task_updated'
  title: string
  description?: string
  timestamp: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch task statistics
      const { data: tasks } = await supabase
        .from('tasks')
        .select('completed')
        .eq('user_id', user.id)

      const totalTasks = tasks?.length || 0
      const completedTasks = tasks?.filter(task => task.completed).length || 0
      const activeTasks = totalTasks - completedTasks

      // Fetch project statistics
      const { data: projects } = await supabase
        .from('projects')
        .select('status')
        .eq('user_id', user.id)

      const totalProjects = projects?.length || 0
      const activeProjects = projects?.filter(project => project.status === 'active').length || 0
      const completedProjects = projects?.filter(project => project.status === 'completed').length || 0

      setStats({
        totalTasks,
        completedTasks,
        activeTasks,
        totalProjects,
        activeProjects,
        completedProjects,
      })

      // Simulate recent activities (in a real app, you'd have an activities table)
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'task_created',
          title: 'Created new task',
          description: 'Review project requirements',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          type: 'project_created',
          title: 'Created new project',
          description: 'Website redesign project',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          type: 'task_completed',
          title: 'Completed task',
          description: 'Design system components',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
      ]

      setActivities(mockActivities)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back! Here&apos;s what&apos;s happening with your projects.
                </p>
              </div>
              <div className="flex space-x-2">
                <TaskForm onTaskCreated={fetchDashboardData} />
                <ProjectForm onProjectCreated={fetchDashboardData} />
              </div>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Content Grid */}
            <div className="grid gap-8 md:grid-cols-2">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-start">
                    <Link href="/tasks">
                      <CheckSquare className="h-4 w-4 mr-2" />
                      View All Tasks
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/projects">
                      <FolderKanban className="h-4 w-4 mr-2" />
                      View All Projects
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <RecentActivities activities={activities} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}