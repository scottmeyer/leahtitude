'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, FolderKanban, Plus, Edit } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Activity {
  id: string
  type: 'task_created' | 'task_completed' | 'project_created' | 'task_updated'
  title: string
  description?: string
  timestamp: string
}

interface RecentActivitiesProps {
  activities: Activity[]
}

const activityIcons = {
  task_created: Plus,
  task_completed: CheckSquare,
  project_created: FolderKanban,
  task_updated: Edit,
}

const activityColors = {
  task_created: 'bg-blue-500',
  task_completed: 'bg-green-500',
  project_created: 'bg-purple-500',
  task_updated: 'bg-orange-500',
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>No recent activity to display.</p>
            <p className="text-sm mt-1">Start by creating a task or project!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type]
            const colorClass = activityColors[activity.type]
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`rounded-full p-1 ${colorClass}`}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </Badge>
                  </div>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}