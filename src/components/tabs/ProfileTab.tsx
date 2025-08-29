import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, BookOpen, LogOut } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  teacher_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
  course_videos?: Array<{
    id: string;
    title: string;
    duration?: number;
  }>;
}

export const ProfileTab: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  const { data: userCourses } = useQuery({
    queryKey: ['user-courses', user?.id],
    queryFn: async () => {
      if (!user?.id || profile?.role !== 'teacher') return [];
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
    enabled: !!user?.id && profile?.role === 'teacher',
  });

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Profile</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              User Information
              <Badge variant={profile.role === 'teacher' ? 'default' : 'secondary'}>
                {profile.role}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-foreground">{profile.full_name || 'Not set'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-foreground">{user?.email}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
            </div>

            <div className="pt-4">
              <Button variant="destructive" onClick={signOut} className="w-full gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {profile.role === 'teacher' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Created Courses
              </CardTitle>
              <CardDescription>
                {userCourses?.length || 0} courses created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userCourses && userCourses.length > 0 ? (
                <div className="space-y-3">
                  {userCourses.map((course) => (
                    <div key={course.id} className="border border-border rounded-lg p-3">
                      <h4 className="font-medium text-foreground">{course.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created on {new Date(course.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No courses created yet.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};