import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BookOpen, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

const Index = () => {
  const { user, profile, signOut } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <GraduationCap className="h-12 w-12 text-primary" />
              <h1 className="text-6xl font-bold text-primary">SEEKHO</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover, learn, and grow with our comprehensive e-learning platform. 
              Connect with expert teachers and unlock your potential.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Rich Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access high-quality video courses, interactive materials, and comprehensive resources.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Expert Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn from qualified instructors who are passionate about sharing their knowledge.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Flexible Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Study at your own pace, anywhere and anytime that suits your schedule.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <nav className="bg-card border-b px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">SEEKHO</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Welcome, {profile?.full_name || 'User'} ({profile?.role})
              </span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              {profile?.role === 'teacher' ? 'Teacher Dashboard' : 'Student Dashboard'}
            </h2>
            <p className="text-muted-foreground">
              {profile?.role === 'teacher' 
                ? 'Manage your courses and help students learn' 
                : 'Explore courses and continue your learning journey'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {profile?.role === 'teacher' 
                    ? 'View and manage your created courses'
                    : 'Access your enrolled courses'
                  }
                </p>
                <Button className="w-full">
                  {profile?.role === 'teacher' ? 'Manage Courses' : 'View My Courses'}
                </Button>
              </CardContent>
            </Card>

            {profile?.role === 'teacher' && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Create a new course and upload videos
                  </p>
                  <Button className="w-full">Create New Course</Button>
                </CardContent>
              </Card>
            )}

            {profile?.role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle>Browse Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Discover new courses to enroll in
                  </p>
                  <Button className="w-full">Browse Courses</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
