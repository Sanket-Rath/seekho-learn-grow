import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CoursesGrid } from '@/components/CoursesGrid';
import { CreateCourseForm } from '@/components/CreateCourseForm';
import { GraduationCap, BookOpen, Users, Award, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const { user, profile, loading, signOut } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="bg-primary/10 p-6 rounded-full">
                <GraduationCap className="w-16 h-16 text-primary" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-foreground mb-6 tracking-tight">
              Welcome to <span className="text-primary">SEEKHO</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Your gateway to knowledge and growth. Join thousands of learners and educators 
              in our interactive learning community.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <BookOpen className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Rich Courses</CardTitle>
                  <CardDescription>
                    Access comprehensive courses designed by expert educators
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <Users className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Interactive Learning</CardTitle>
                  <CardDescription>
                    Engage with peers and instructors in a collaborative environment
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <Award className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>Track Progress</CardTitle>
                  <CardDescription>
                    Monitor your learning journey and celebrate achievements
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-4">
              <Button 
                size="lg" 
                className="px-12 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={() => window.location.href = '/auth'}
              >
                Get Started Today
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Ready to begin your learning journey? Join us now!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <CreateCourseForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Welcome back, {profile.full_name || 'User'}!
            </h1>
            <p className="text-muted-foreground mt-2">
              {profile.role === 'teacher' ? 'Manage your courses and inspire students' : 'Continue your learning journey'}
            </p>
          </div>
          
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Courses Section */}
        <CoursesGrid
          onCreateCourse={() => setShowCreateForm(true)}
          onViewCourse={handleViewCourse}
          onEditCourse={handleEditCourse}
        />
      </div>
    </div>
  );
}
