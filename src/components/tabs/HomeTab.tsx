import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CourseCard } from '@/components/CourseCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

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

export const HomeTab: React.FC = () => {
  const navigate = useNavigate();
  const { data: recentCourses, isLoading } = useQuery({
    queryKey: ['recent-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:teacher_id (
            full_name
          ),
          course_videos (
            id,
            title,
            duration
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Course[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Recent Courses</h2>
      </div>
      
      {recentCourses && recentCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onViewCourse={(courseId) => navigate(`/course/${courseId}`)}
              isTeacher={false}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Courses Available</CardTitle>
            <CardDescription>
              There are no courses available at the moment. Check back later!
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};