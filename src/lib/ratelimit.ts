import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Global API Rate Limit: 100 requests per minute per IP
export const globalApiLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/global",
});

// Signup Rate Limit: 3 attempts per hour per IP
export const signupLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  analytics: true,
  prefix: "@upstash/ratelimit/signup",
});

// Checkout Rate Limit: 10 requests per minute per IP
export const checkoutLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/checkout",
});

// Login Rate Limit: 5 failed attempts -> 12 hour block
// Tracked by IP + Email
export const loginLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "12 h"),
  analytics: true,
  prefix: "@upstash/ratelimit/login",
});

/**
 * Helper to get the IP address from the request
 */
export function getIP(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0];
  return "127.0.0.1";
}
