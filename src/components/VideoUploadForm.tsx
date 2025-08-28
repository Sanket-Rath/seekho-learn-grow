import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Video } from 'lucide-react';

interface VideoUploadFormProps {
  courseId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const VideoUploadForm: React.FC<VideoUploadFormProps> = ({
  courseId,
  onSuccess,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video files must be under 100MB.",
          variant: "destructive",
        });
        return;
      }
      
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !videoFile) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select a video file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Upload video to storage
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${courseId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-videos')
        .upload(fileName, videoFile);

      if (uploadError) {
        console.error('Error uploading video:', uploadError);
        toast({
          title: "Upload failed",
          description: "Failed to upload video. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('course-videos')
        .getPublicUrl(fileName);

      // Create video record in database
      const { error: dbError } = await supabase
        .from('course_videos')
        .insert([
          {
            course_id: courseId,
            title: title.trim(),
            description: description.trim(),
            video_url: urlData.publicUrl,
            order_index: Date.now() // Simple ordering for now
          }
        ]);

      if (dbError) {
        console.error('Error creating video record:', dbError);
        
        // Clean up uploaded file
        await supabase.storage
          .from('course-videos')
          .remove([fileName]);
          
        toast({
          title: "Error saving video",
          description: "Please try again later.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Video uploaded successfully",
        description: `"${title}" has been added to the course.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Upload Course Video
        </CardTitle>
        <CardDescription>
          Add a new video to your course. Supported formats: MP4, WebM, MOV (max 100MB).
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="video-title">Video Title *</Label>
            <Input
              id="video-title"
              type="text"
              placeholder="Enter video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-description">Video Description *</Label>
            <Textarea
              id="video-description"
              placeholder="Describe what this video covers"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-file">Video File *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              
              {videoFile ? (
                <div className="text-center">
                  <Video className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{videoFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => document.getElementById('video-file')?.click()}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('video-file')?.click()}
                  >
                    Select Video File
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    MP4, WebM, MOV up to 100MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Video'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};