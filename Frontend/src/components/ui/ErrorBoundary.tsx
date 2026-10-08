import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./Button";
import { AlertTriangle, RefreshCw, Compass } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Robust Application-Level Error Boundary for OFFBEAT
 * Catches render-phase component exceptions, prevents white-screen crashes,
 * and presents an intentional, user-friendly recovery interface.
 */
export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Safe console logging without exposing sensitive internals to end users
    console.warn(
      "[OFFBEAT ErrorBoundary] Handled component exception:",
      error.message,
      errorInfo.componentStack,
    );
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[420px] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-offbeat-surface/90 border border-offbeat-border/80 rounded-2xl p-8 backdrop-blur shadow-2xl flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-offbeat-primary mb-2 tracking-tight">
              OFFBEAT couldn't load this experience.
            </h2>

            <p className="text-sm text-offbeat-muted leading-relaxed mb-6">
              A temporary issue prevented this view from rendering cleanly. Your preferences and
              saved selections remain safe.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <Button
                variant="primary"
                onClick={this.handleReset}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                TRY AGAIN
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/discovery";
                }}
                leftIcon={<Compass className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                BACK TO DISCOVERY
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
