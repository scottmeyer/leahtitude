'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Project } from '@/types/database'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Navigation } from '@/components/layout/navigation'
import { ProjectForm } from '@/components/projects/project-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, FolderKanban, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const statusColors = {
  active: 'bg-green-500',
  completed: 'bg-blue-500',
  archived: 'bg-gray-500',
}

const statusLabels = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchProjects = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [user, refreshTrigger])

  const handleProjectCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const updateProjectStatus = async (projectId: string, status: Project['status']) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)

      if (error) throw error

      setProjects(projects.map(project => 
        project.id === projectId ? { ...project, status } : project
      ))

      toast.success('Project status updated!')
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      setProjects(projects.filter(project => project.id !== projectId))
      toast.success('Project deleted')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Projects</h1>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-20 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
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
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <p className="text-muted-foreground">
                  Organize your work into projects and track progress.
                </p>
              </div>
              <ProjectForm onProjectCreated={handleProjectCreated} />
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-6 text-muted-foreground">
                    <FolderKanban className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No projects found.</p>
                    <p className="text-sm mt-1">Create your first project to get started!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card key={project.id} className="transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FolderKanban className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateProjectStatus(project.id, 'active')}>
                              Mark as Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateProjectStatus(project.id, 'completed')}>
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateProjectStatus(project.id, 'archived')}>
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteProject(project.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          'text-xs text-white w-fit',
                          statusColors[project.status]
                        )}
                      >
                        {statusLabels[project.status]}
                      </Badge>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}