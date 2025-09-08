'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Task } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Calendar, Flag, Trash2, Edit } from 'lucide-react'
import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface TaskListProps {
  refreshTrigger?: number
}

const priorityColors = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
}

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function TaskList({ refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchTasks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [user, refreshTrigger])

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: !completed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: !completed } : task
      ))

      toast.success(completed ? 'Task marked as incomplete' : 'Task completed!')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.filter(task => task.id !== taskId))
      toast.success('Task deleted')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-6 text-muted-foreground">
            <p>No tasks found.</p>
            <p className="text-sm mt-1">Create your first task to get started!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

  const TaskCard = ({ task }: { task: Task }) => {
    const isOverdue = task.due_date && !task.completed && isAfter(new Date(), parseISO(task.due_date))
    
    return (
      <Card className={cn(
        'transition-all hover:shadow-md',
        task.completed && 'opacity-75',
        isOverdue && 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/50'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id, task.completed)}
              className="mt-1"
            />
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  'font-medium',
                  task.completed && 'line-through text-muted-foreground'
                )}>
                  {task.title}
                </h3>
                
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
                    <DropdownMenuItem 
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {task.description && (
                <p className={cn(
                  'text-sm text-muted-foreground',
                  task.completed && 'line-through'
                )}>
                  {task.description}
                </p>
              )}

              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'text-xs text-white',
                    priorityColors[task.priority]
                  )}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  {priorityLabels[task.priority]}
                </Badge>

                {task.due_date && (
                  <Badge 
                    variant={isOverdue ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(parseISO(task.due_date), 'MMM d, yyyy')}
                  </Badge>
                )}

                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {activeTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Tasks ({activeTasks.length})</h3>
          {activeTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Completed ({completedTasks.length})</h3>
          {completedTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}