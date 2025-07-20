
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface EnhancedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  striped?: boolean;
}

const EnhancedProgress = forwardRef<HTMLDivElement, EnhancedProgressProps>(
  ({ 
    value, 
    max = 100, 
    className, 
    showLabel = false,
    label,
    variant = 'default',
    size = 'md',
    animated = false,
    striped = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };

    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500'
    };

    return (
      <div className="w-full">
        {(showLabel || label) && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {label || `${percentage.toFixed(0)}%`}
            </span>
            {showLabel && !label && (
              <span className="text-sm text-muted-foreground">
                {value} / {max}
              </span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(
            "relative overflow-hidden rounded-full bg-muted",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              variantClasses[variant],
              animated && "animate-pulse",
              striped && "bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%] animate-[slide_1s_linear_infinite]"
            )}
            style={{ width: `${percentage}%` }}
          />
          
          {/* Glow Effect */}
          <div
            className={cn(
              "absolute top-0 h-full opacity-30 blur-sm transition-all duration-500",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

EnhancedProgress.displayName = "EnhancedProgress";

export { EnhancedProgress };

// Loading Progress Component
export function LoadingProgress({ 
  steps, 
  currentStep, 
  className 
}: { 
  steps: string[];
  currentStep: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <EnhancedProgress
        value={currentStep}
        max={steps.length - 1}
        showLabel
        label={`Schritt ${currentStep + 1} von ${steps.length}`}
        animated
      />
      
      <div className="text-center">
        <p className="text-sm font-medium">{steps[currentStep]}</p>
      </div>
      
      <div className="flex justify-center space-x-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index <= currentStep ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Upload Progress Component  
export function UploadProgress({ 
  files, 
  className 
}: { 
  files: Array<{ name: string; progress: number; status: 'uploading' | 'completed' | 'error' }>;
  className?: string;
}) {
  const totalProgress = files.reduce((sum, file) => sum + file.progress, 0) / files.length;

  return (
    <div className={cn("space-y-3", className)}>
      <EnhancedProgress
        value={totalProgress}
        showLabel
        label="Gesamt-Upload"
        variant={totalProgress === 100 ? 'success' : 'default'}
      />
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {files.map((file, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {file.progress}%
                </span>
              </div>
              <EnhancedProgress
                value={file.progress}
                size="sm"
                variant={
                  file.status === 'error' ? 'danger' :
                  file.status === 'completed' ? 'success' : 'default'
                }
              />
            </div>
            
            <div className="text-lg">
              {file.status === 'completed' && '✅'}
              {file.status === 'error' && '❌'}
              {file.status === 'uploading' && '⏳'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
