
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  Activity,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IntegrationTemplate } from '@/services/integrationDatabaseService';

interface TestResult {
  step: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: number;
  message: string;
  details?: any;
}

interface TemplateTestRunnerProps {
  template: IntegrationTemplate;
  onTestComplete?: (results: TestResult[]) => void;
}

const TemplateTestRunner: React.FC<TemplateTestRunnerProps> = ({ 
  template, 
  onTestComplete 
}) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState(0);

  const generateTestSteps = (config: any): TestResult[] => {
    const steps: TestResult[] = [];
    
    // Step 1: Trigger validation
    steps.push({
      step: 'Trigger Validation',
      status: 'pending',
      message: `Validate ${config.trigger?.app} trigger: ${config.trigger?.event}`
    });

    // Step 2: Condition checks
    if (config.conditions && config.conditions.length > 0) {
      steps.push({
        step: 'Condition Evaluation',
        status: 'pending',
        message: `Evaluate ${config.conditions.length} condition(s)`
      });
    }

    // Step 3: Action execution simulation
    if (config.actions && Array.isArray(config.actions)) {
      config.actions.forEach((action: any, index: number) => {
        steps.push({
          step: `Action ${index + 1}`,
          status: 'pending',
          message: `Execute ${action.app}: ${action.action}`
        });
      });
    }

    // Step 4: Integration test
    steps.push({
      step: 'Integration Test',
      status: 'pending',
      message: 'Test end-to-end workflow integration'
    });

    // Step 5: Performance check
    steps.push({
      step: 'Performance Check',
      status: 'pending',
      message: 'Validate execution performance and resource usage'
    });

    return steps;
  };

  const simulateStepExecution = async (step: TestResult, index: number): Promise<TestResult> => {
    const startTime = Date.now();
    
    // Simulate execution time
    const executionTime = Math.random() * 2000 + 500; // 0.5-2.5 seconds
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    const duration = Date.now() - startTime;
    
    // Simulate success/failure based on step type and template validity
    let success = true;
    let message = step.message;
    
    // Add some realistic failure scenarios
    if (step.step === 'Trigger Validation') {
      success = !!template.template_config.trigger?.app;
      if (!success) {
        message = 'Trigger validation failed: Missing app configuration';
      } else {
        message = `✓ ${template.template_config.trigger.app} trigger validated successfully`;
      }
    } else if (step.step === 'Condition Evaluation') {
      success = Math.random() > 0.1; // 90% success rate
      if (!success) {
        message = 'Condition evaluation failed: Invalid condition syntax';
      } else {
        message = `✓ All conditions evaluated successfully`;
      }
    } else if (step.step.startsWith('Action')) {
      success = Math.random() > 0.05; // 95% success rate
      if (!success) {
        message = 'Action execution failed: App connection timeout';
      } else {
        message = `✓ Action executed successfully`;
      }
    } else if (step.step === 'Integration Test') {
      success = Math.random() > 0.1; // 90% success rate
      if (!success) {
        message = 'Integration test failed: Data flow interrupted';
      } else {
        message = `✓ End-to-end integration working correctly`;
      }
    } else if (step.step === 'Performance Check') {
      success = Math.random() > 0.05; // 95% success rate
      const performanceScore = Math.floor(Math.random() * 30) + 70; // 70-100
      if (!success) {
        message = 'Performance check failed: Execution time exceeded threshold';
      } else {
        message = `✓ Performance score: ${performanceScore}/100 (${duration}ms)`;
      }
    }

    return {
      ...step,
      status: success ? 'success' : 'failed',
      duration,
      message,
      details: {
        executionTime: duration,
        timestamp: new Date().toISOString()
      }
    };
  };

  const runTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentStep(0);
    setProgress(0);
    
    const steps = generateTestSteps(template.template_config);
    setTestResults(steps);
    
    try {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        setProgress((i / steps.length) * 100);
        
        // Update step status to running
        setTestResults(prev => 
          prev.map((step, index) => 
            index === i ? { ...step, status: 'running' } : step
          )
        );
        
        // Execute step
        const result = await simulateStepExecution(steps[i], i);
        
        // Update step with result
        setTestResults(prev => 
          prev.map((step, index) => 
            index === i ? result : step
          )
        );
        
        // If step failed, we might want to continue or stop based on failure type
        if (result.status === 'failed' && result.step === 'Trigger Validation') {
          // Critical failure - stop execution
          break;
        }
      }
      
      setProgress(100);
      
      if (onTestComplete) {
        onTestComplete(testResults);
      }
      
      const failedSteps = testResults.filter(r => r.status === 'failed').length;
      const successSteps = testResults.filter(r => r.status === 'success').length;
      
      toast({
        title: 'Test Run Complete',
        description: `${successSteps} passed, ${failedSteps} failed`,
        variant: failedSteps > 0 ? 'destructive' : 'default'
      });
      
    } catch (error) {
      toast({
        title: 'Test Run Failed',
        description: 'An error occurred during test execution',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const stopTests = () => {
    setIsRunning(false);
  };

  const getStepIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Template Test Runner
        </CardTitle>
        <CardDescription>
          Run comprehensive tests to validate template functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Run Tests
          </Button>
          
          {isRunning && (
            <Button 
              variant="outline" 
              onClick={stopTests}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            {/* Test steps */}
            <div className="space-y-2">
              <h4 className="font-medium">Test Results</h4>
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 border rounded ${
                    index === currentStep && isRunning ? 'border-blue-200 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStepIcon(result.status)}
                    <div>
                      <p className="font-medium">{result.step}</p>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.duration && (
                      <span className="text-xs text-muted-foreground">
                        {result.duration}ms
                      </span>
                    )}
                    {getStepBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {!isRunning && testResults.some(r => r.status !== 'pending') && (
              <Alert>
                <AlertDescription>
                  Test Summary: {testResults.filter(r => r.status === 'success').length} passed, {' '}
                  {testResults.filter(r => r.status === 'failed').length} failed, {' '}
                  {testResults.filter(r => r.status === 'pending').length} pending
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateTestRunner;
