import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

function reportError(error: Error, info: ErrorInfo) {
  console.error("[ErrorBoundary]", error, info);
  api.post("/api/errors/client", {
    message: error.message,
    stack: error.stack,
    componentStack: info.componentStack,
    url: window.location.href,
    userAgent: navigator.userAgent,
  }).catch(() => {});
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">An unexpected error occurred</p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
