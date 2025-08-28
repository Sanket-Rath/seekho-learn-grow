import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayCircle, Clock, User } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  teacher_id: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
  course_videos: Array<{
    id: string;
    title: string;
    duration?: number;
  }>;
}

interface CourseCardProps {
  course: Course;
  onViewCourse: (courseId: string) => void;
  isTeacher?: boolean;
  onEditCourse?: (courseId: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onViewCourse,
  isTeacher = false,
  onEditCourse
}) => {
  const totalVideos = course.course_videos?.length || 0;
  const totalDuration = course.course_videos?.reduce((acc, video) => acc + (video.duration || 0), 0) || 0;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <div 
        className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/20 to-secondary/20 h-48 flex items-center justify-center"
        onClick={() => onViewCourse(course.id)}
      >
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <PlayCircle className="w-16 h-16 text-primary/60 group-hover:text-primary transition-colors" />
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-2">
              {course.description}
            </CardDescription>
          </div>
          {isTeacher && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditCourse?.(course.id);
              }}
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{course.profiles?.full_name || 'Unknown Teacher'}</span>
          </div>
          
          {totalVideos > 0 && (
            <>
              <div className="flex items-center gap-1">
                <PlayCircle className="w-4 h-4" />
                <span>{totalVideos} video{totalVideos !== 1 ? 's' : ''}</span>
              </div>
              
              {totalDuration > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Course</Badge>
          
          <Button 
            onClick={() => onViewCourse(course.id)}
            className="bg-primary hover:bg-primary/90"
          >
            View Course
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};