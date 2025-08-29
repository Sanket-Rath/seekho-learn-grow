import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CoursesGrid } from '@/components/CoursesGrid';
import { CreateCourseForm } from '@/components/CreateCourseForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyCoursesTab: React.FC = () => {
  const { profile } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleEditCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Create New Course</h2>
          </div>
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            Cancel
          </Button>
        </div>
        <CreateCourseForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            {profile?.role === 'teacher' ? 'My Courses' : 'Enrolled Courses'}
          </h2>
        </div>
        {profile?.role === 'teacher' && (
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Course
          </Button>
        )}
      </div>

      {profile?.role === 'student' ? (
        <Card>
          <CardHeader>
            <CardTitle>Course Enrollment Coming Soon</CardTitle>
            <CardDescription>
              Course enrollment functionality will be available soon. For now, you can browse all available courses in the Courses tab.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <CoursesGrid
          onCreateCourse={() => setShowCreateForm(true)}
          onViewCourse={handleViewCourse}
          onEditCourse={handleEditCourse}
        />
      )}
    </div>
  );
};