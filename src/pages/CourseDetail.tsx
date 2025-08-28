import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoUploadForm } from '@/components/VideoUploadForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Calendar, Plus, PlayCircle, Clock } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration?: number;
  order_index: number;
  created_at: string;
}

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  const isTeacher = profile?.role === 'teacher';
  const isOwner = course?.teacher_id === profile?.id;

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:teacher_id (
            full_name
          )
        `)
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('Error fetching course:', courseError);
        toast({
          title: "Error loading course",
          description: "Course not found or access denied.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setCourse(courseData);

      // Fetch course videos
      const { data: videosData, error: videosError } = await supabase
        .from('course_videos')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (videosError) {
        console.error('Error fetching videos:', videosError);
        toast({
          title: "Error loading videos",
          description: "Please try again later.",
          variant: "destructive",
        });
      } else {
        setVideos(videosData || []);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: "Error loading course",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchCourseData(); // Refresh course data
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Duration not available';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (showUploadForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl py-8">
          <VideoUploadForm
            courseId={courseId!}
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="container mx-auto max-w-4xl py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          
          {isOwner && (
            <Button onClick={() => setShowUploadForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          )}
        </div>

        {/* Course Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{course.title}</CardTitle>
            <CardDescription className="text-lg mt-2">
              {course.description}
            </CardDescription>
            
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{course.profiles?.full_name || 'Unknown Teacher'}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(course.created_at)}</span>
              </div>
              
              <Badge variant="secondary">
                {videos.length} video{videos.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Videos Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Course Videos</h2>
          
          {videos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <PlayCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No videos available
                </h3>
                <p className="text-muted-foreground">
                  {isOwner 
                    ? 'Upload your first video to get started.'
                    : 'The instructor hasn\'t added any videos yet.'
                  }
                </p>
                {isOwner && (
                  <Button onClick={() => setShowUploadForm(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Video
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <Card key={video.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <PlayCircle className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {index + 1}. {video.title}
                            </h3>
                            <p className="text-muted-foreground mb-2">
                              {video.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDuration(video.duration)}</span>
                              </div>
                              <span>Added {formatDate(video.created_at)}</span>
                            </div>
                          </div>
                          
                          <Button 
                            className="flex-shrink-0"
                            onClick={() => window.open(video.video_url, '_blank')}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Watch
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}