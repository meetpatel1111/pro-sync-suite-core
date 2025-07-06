
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Eye, Image, Zap, Download, Share } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const AIImageAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis({
        objects: ['laptop', 'coffee cup', 'notebook', 'pen'],
        text: 'Working on project documentation',
        sentiment: 'focused',
        colors: ['#2563eb', '#f59e0b', '#10b981'],
        confidence: 0.94,
        suggestions: [
          'This appears to be a productive workspace',
          'Consider organizing cables for better aesthetics',
          'Good lighting for photography'
        ]
      });
      setIsAnalyzing(false);
      toast({
        title: 'Analysis Complete',
        description: 'AI has successfully analyzed your image'
      });
    }, 2000);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          AI Image Analyzer
        </CardTitle>
        <CardDescription>
          Analyze images with AI to extract insights and metadata
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedImage ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Upload an image to analyze</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Button asChild>
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Select Image
              </label>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedImage(null);
                  setAnalysis(null);
                }}
              >
                Change
              </Button>
            </div>

            <Button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Analyze Image
                </>
              )}
            </Button>

            {analysis && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Analysis Results</h4>
                  <Badge>
                    {Math.round(analysis.confidence * 100)}% confident
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium mb-1">Detected Objects:</h5>
                    <div className="flex flex-wrap gap-1">
                      {analysis.objects.map((obj: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {obj}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-1">Extracted Text:</h5>
                    <p className="text-sm text-gray-600">{analysis.text}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-1">Dominant Colors:</h5>
                    <div className="flex gap-1">
                      {analysis.colors.map((color: string, idx: number) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-1">AI Suggestions:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {analysis.suggestions.map((suggestion: string, idx: number) => (
                        <li key={idx}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Results
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="mr-2 h-4 w-4" />
                    Share Analysis
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIImageAnalyzer;
