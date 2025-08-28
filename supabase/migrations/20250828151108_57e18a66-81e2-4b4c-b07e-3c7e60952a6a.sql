-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_videos table
CREATE TABLE public.course_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration INTEGER, -- duration in seconds
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Students can view all courses" 
ON public.courses 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can create their own courses" 
ON public.courses 
FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own courses" 
ON public.courses 
FOR UPDATE 
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own courses" 
ON public.courses 
FOR DELETE 
USING (auth.uid() = teacher_id);

-- RLS Policies for course_videos
CREATE POLICY "Students can view all course videos" 
ON public.course_videos 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can create videos for their own courses" 
ON public.course_videos 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_videos.course_id 
    AND courses.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update videos for their own courses" 
ON public.course_videos 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_videos.course_id 
    AND courses.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete videos for their own courses" 
ON public.course_videos 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_videos.course_id 
    AND courses.teacher_id = auth.uid()
  )
);

-- Create storage bucket for course videos
INSERT INTO storage.buckets (id, name, public) VALUES ('course-videos', 'course-videos', true);

-- Create storage policies for course videos
CREATE POLICY "Teachers can upload course videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Everyone can view course videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-videos');

CREATE POLICY "Teachers can update their course videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Teachers can delete their course videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-videos' AND auth.role() = 'authenticated');

-- Add triggers for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_videos_updated_at
BEFORE UPDATE ON public.course_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample courses
INSERT INTO public.courses (title, description, teacher_id) VALUES 
('Introduction to Mathematics', 'Learn basic mathematical concepts and operations', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Web Development Fundamentals', 'Master the basics of HTML, CSS, and JavaScript', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1)),
('Science Basics', 'Explore fundamental scientific principles and experiments', (SELECT id FROM public.profiles WHERE role = 'teacher' LIMIT 1));

-- Insert sample videos for courses
INSERT INTO public.course_videos (course_id, title, description, video_url, order_index) VALUES 
((SELECT id FROM public.courses WHERE title = 'Introduction to Mathematics' LIMIT 1), 'Basic Addition and Subtraction', 'Learn how to add and subtract numbers', '/sample-video-1.mp4', 1),
((SELECT id FROM public.courses WHERE title = 'Introduction to Mathematics' LIMIT 1), 'Multiplication Tables', 'Master multiplication with easy techniques', '/sample-video-2.mp4', 2),
((SELECT id FROM public.courses WHERE title = 'Web Development Fundamentals' LIMIT 1), 'HTML Basics', 'Introduction to HTML structure and tags', '/sample-video-3.mp4', 1),
((SELECT id FROM public.courses WHERE title = 'Web Development Fundamentals' LIMIT 1), 'CSS Styling', 'Learn how to style your web pages', '/sample-video-4.mp4', 2),
((SELECT id FROM public.courses WHERE title = 'Science Basics' LIMIT 1), 'The Water Cycle', 'Understanding how water moves in nature', '/sample-video-5.mp4', 1);