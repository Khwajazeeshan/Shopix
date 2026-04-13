'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold text-foreground mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error has occurred. We've been notified and are looking into it.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-6 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}
