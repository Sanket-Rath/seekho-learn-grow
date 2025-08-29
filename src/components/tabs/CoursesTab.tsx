import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CourseCard } from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, BookOpen } from 'lucide-react';
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

export const CoursesTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: allCourses, isLoading } = useQuery({
    queryKey: ['all-courses'],
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
  });

  const filteredCourses = allCourses?.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">All Courses</h2>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredCourses && filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onViewCourse={() => {}}
              isTeacher={false}
            />
          ))}
        </div>
      ) : searchTerm ? (
        <Card>
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
            <CardDescription>
              No courses match your search for "{searchTerm}". Try different keywords.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Courses Available</CardTitle>
            <CardDescription>
              There are no courses available at the moment.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};