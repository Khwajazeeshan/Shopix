import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "YOUR_SENTRY_DSN_HERE",
  tracesSampleRate: 1.0,
  debug: false,
});
