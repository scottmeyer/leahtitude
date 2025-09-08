'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, FolderKanban, Clock, TrendingUp } from 'lucide-react'

interface StatsCardsProps {
  stats: {
    totalTasks: number
    completedTasks: number
    activeTasks: number
    totalProjects: number
    activeProjects: number
    completedProjects: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTasks}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{stats.activeTasks} active</span>
            <Badge variant="secondary" className="px-1 py-0">
              {stats.completedTasks} done
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projects</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{stats.activeProjects} active</span>
            <Badge variant="secondary" className="px-1 py-0">
              {stats.completedProjects} done
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.completedTasks} of {stats.totalTasks} tasks completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeTasks}</div>
          <p className="text-xs text-muted-foreground">
            Tasks in progress
          </p>
        </CardContent>
      </Card>
    </div>
  )
}