
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Upload, Play, Pause, Download, Scissors, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const AIVideoProcessor: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingType, setProcessingType] = useState<string>('');
  const { toast } = useToast();

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedVideo(url);
    }
  };

  const processVideo = async (type: string) => {
    if (!selectedVideo) return;

    setIsProcessing(true);
    setProcessingType(type);
    setProgress(0);

    // Simulate processing with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast({
            title: 'Processing Complete',
            description: `Video ${type} has been completed successfully`
          });
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          AI Video Processor
        </CardTitle>
        <CardDescription>
          Process and enhance videos with AI-powered tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedVideo ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Upload a video to process</p>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="video-upload"
            />
            <Button asChild>
              <label htmlFor="video-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Select Video
              </label>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                src={selectedVideo}
                controls
                className="w-full h-48 rounded-lg bg-black"
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => setSelectedVideo(null)}
              >
                Change
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing: {processingType}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => processVideo('auto-transcription')}
                disabled={isProcessing}
                variant="outline"
                size="sm"
              >
                <Zap className="mr-2 h-4 w-4" />
                Auto Transcribe
              </Button>

              <Button
                onClick={() => processVideo('scene detection')}
                disabled={isProcessing}
                variant="outline"
                size="sm"
              >
                <Scissors className="mr-2 h-4 w-4" />
                Scene Detection
              </Button>

              <Button
                onClick={() => processVideo('summary generation')}
                disabled={isProcessing}
                variant="outline"
                size="sm"
              >
                <Play className="mr-2 h-4 w-4" />
                Generate Summary
              </Button>

              <Button
                onClick={() => processVideo('quality enhancement')}
                disabled={isProcessing}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Enhance Quality
              </Button>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Available Features:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">AI</Badge>
                  <span>Automatic speech-to-text transcription</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">AI</Badge>
                  <span>Smart scene detection and segmentation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">AI</Badge>
                  <span>Intelligent content summarization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">AI</Badge>
                  <span>Video quality enhancement</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIVideoProcessor;
