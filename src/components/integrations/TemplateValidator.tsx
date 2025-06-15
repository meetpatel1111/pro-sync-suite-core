
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Loader2,
  Settings,
  Eye,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IntegrationTemplate } from '@/services/integrationDatabaseService';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  compatibility: {
    app: string;
    status: 'compatible' | 'warning' | 'incompatible';
    message: string;
  }[];
}

interface TemplateValidatorProps {
  template: IntegrationTemplate;
  onValidationComplete?: (result: ValidationResult) => void;
}

const TemplateValidator: React.FC<TemplateValidatorProps> = ({ 
  template, 
  onValidationComplete 
}) => {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const validateTemplateConfig = (config: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const compatibility: ValidationResult['compatibility'] = [];

    // Validate basic structure
    if (!config.trigger) {
      errors.push('Template must have a trigger configuration');
    } else {
      if (!config.trigger.app) {
        errors.push('Trigger must specify an app');
      }
      if (!config.trigger.event) {
        errors.push('Trigger must specify an event');
      }
    }

    if (!config.actions || !Array.isArray(config.actions) || config.actions.length === 0) {
      errors.push('Template must have at least one action');
    } else {
      config.actions.forEach((action: any, index: number) => {
        if (!action.app) {
          errors.push(`Action ${index + 1} must specify an app`);
        }
        if (!action.action) {
          errors.push(`Action ${index + 1} must specify an action type`);
        }
      });
    }

    // Validate app compatibility
    const allApps = [config.trigger?.app, ...(config.actions?.map((a: any) => a.app) || [])].filter(Boolean);
    const validApps = [
      'TaskMaster', 'TimeTrackPro', 'CollabSpace', 'PlanBoard', 
      'FileVault', 'BudgetBuddy', 'InsightIQ', 'ResourceHub', 
      'ClientConnect', 'RiskRadar'
    ];

    allApps.forEach((app: string) => {
      if (validApps.includes(app)) {
        compatibility.push({
          app,
          status: 'compatible',
          message: `${app} is fully supported`
        });
      } else {
        compatibility.push({
          app,
          status: 'incompatible',
          message: `${app} is not a recognized ProSync Suite application`
        });
        errors.push(`Unknown app: ${app}`);
      }
    });

    // Validate conditions
    if (config.conditions && Array.isArray(config.conditions)) {
      config.conditions.forEach((condition: any, index: number) => {
        if (!condition.field) {
          warnings.push(`Condition ${index + 1} should specify a field`);
        }
        if (!condition.operator) {
          warnings.push(`Condition ${index + 1} should specify an operator`);
        }
      });
    }

    // Performance suggestions
    if (config.actions && config.actions.length > 5) {
      suggestions.push('Consider splitting complex workflows into smaller templates for better performance');
    }

    if (!config.conditions || config.conditions.length === 0) {
      suggestions.push('Adding conditions can help prevent unnecessary executions and improve efficiency');
    }

    // Security validations
    const hasExternalApps = allApps.some(app => !validApps.includes(app));
    if (hasExternalApps) {
      warnings.push('Template includes external applications - ensure proper security measures');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      compatibility
    };
  };

  const runValidation = async () => {
    setIsValidating(true);
    
    try {
      // Simulate validation process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = validateTemplateConfig(template.template_config);
      setValidationResult(result);
      
      if (onValidationComplete) {
        onValidationComplete(result);
      }

      toast({
        title: result.isValid ? 'Validation Successful' : 'Validation Issues Found',
        description: result.isValid 
          ? 'Template configuration is valid and ready to use'
          : `Found ${result.errors.length} errors and ${result.warnings.length} warnings`,
        variant: result.isValid ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Validation Failed',
        description: 'An error occurred while validating the template',
        variant: 'destructive'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compatible':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'incompatible':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Template Validator
        </CardTitle>
        <CardDescription>
          Validate template configuration and compatibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={runValidation} 
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isValidating ? 'Validating...' : 'Run Validation'}
          </Button>
          
          {validationResult && (
            <Button 
              variant="outline" 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          )}
        </div>

        {validationResult && (
          <div className="space-y-4">
            {/* Validation Summary */}
            <Alert className={validationResult.isValid ? 'border-green-200' : 'border-red-200'}>
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  {validationResult.isValid ? (
                    'Template configuration is valid and ready for deployment'
                  ) : (
                    `Validation failed: ${validationResult.errors.length} errors, ${validationResult.warnings.length} warnings`
                  )}
                </AlertDescription>
              </div>
            </Alert>

            {/* App Compatibility */}
            <div>
              <h4 className="font-medium mb-2">App Compatibility</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {validationResult.compatibility.map((comp, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    {getStatusIcon(comp.status)}
                    <span className="font-medium">{comp.app}</span>
                    <Badge variant={comp.status === 'compatible' ? 'default' : 'destructive'}>
                      {comp.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {showDetails && (
              <div className="space-y-3">
                {/* Errors */}
                {validationResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Errors</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="text-red-600 text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {validationResult.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-600 mb-2">Warnings</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className="text-yellow-600 text-sm">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {validationResult.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2">Suggestions</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-blue-600 text-sm">{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateValidator;
