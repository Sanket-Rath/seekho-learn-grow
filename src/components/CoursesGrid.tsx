import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CourseCard } from './CourseCard';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

interface CoursesGridProps {
  onCreateCourse?: () => void;
  onViewCourse: (courseId: string) => void;
  onEditCourse?: (courseId: string) => void;
}

export const CoursesGrid: React.FC<CoursesGridProps> = ({
  onCreateCourse,
  onViewCourse,
  onEditCourse
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const isTeacher = profile?.role === 'teacher';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      let query = supabase
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

      // If teacher, show only their courses
      if (isTeacher && profile?.id) {
        query = query.eq('teacher_id', profile.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: "Error loading courses",
          description: "Please try again later.",
          variant: "destructive",
        });
        return;
      }

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error loading courses",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg h-48 mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">
            {isTeacher ? 'My Courses' : 'Available Courses'}
          </h2>
        </div>
        
        {isTeacher && onCreateCourse && (
          <Button onClick={onCreateCourse} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {isTeacher ? 'No courses created yet' : 'No courses available'}
          </h3>
          <p className="text-muted-foreground">
            {isTeacher 
              ? 'Create your first course to get started with teaching.'
              : 'Check back later for new courses.'
            }
          </p>
          {isTeacher && onCreateCourse && (
            <Button onClick={onCreateCourse} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Course
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onViewCourse={onViewCourse}
              isTeacher={isTeacher}
              onEditCourse={onEditCourse}
            />
          ))}
        </div>
      )}
    </div>
  );
};