import { NextRequest, NextResponse } from "next/server";

// In-memory sliding window rate limiter.
// For multi-instance deployments (Vercel, K8s), replace with Redis/Upstash.
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const apiRateLimitStore = new Map<string, RateLimitEntry>();
const pageRateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_CONFIG = {
  api:  { windowMs: 60_000, maxRequests: 100 },
  page: { windowMs: 60_000, maxRequests: 300 },
};

let lastCleanup = Date.now();
function pruneExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < 300_000) return;
  lastCleanup = now;
  for (const [ip, entry] of apiRateLimitStore) {
    if (entry.resetAt < now) apiRateLimitStore.delete(ip);
  }
  for (const [ip, entry] of pageRateLimitStore) {
    if (entry.resetAt < now) pageRateLimitStore.delete(ip);
  }
}

function checkRateLimit(
  ip: string,
  store: Map<string, RateLimitEntry>,
  windowMs: number,
  maxRequests: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = store.get(ip);

  if (!existing || existing.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

const BLOCKED_UA_PATTERNS = [
  /sqlmap/i,
  /nikto/i,
  /masscan/i,
  /nmap/i,
  /dirbuster/i,
  /burpsuite/i,
  /zgrab/i,
  /python-requests\/[01]\./i,
  /libwww-perl/i,
  /Go-http-client\/1\.0/i,
  /curl\/[0-6]\./i,
  /\bscanner\b/i,
  /\bfuzzer\b/i,
  /\bexploit\b/i,
];

function isBlockedUserAgent(ua: string): boolean {
  if (!ua || ua.length === 0) return true;
  if (ua.length > 512) return true;
  return BLOCKED_UA_PATTERNS.some((pattern) => pattern.test(ua));
}

function extractIp(request: NextRequest): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

const API_PATH_PREFIX = "/api/";

export function middleware(request: NextRequest): NextResponse {
  pruneExpiredEntries();

  const { pathname } = request.nextUrl;
  const ip = extractIp(request);
  const ua = request.headers.get("user-agent") ?? "";

  if (isBlockedUserAgent(ua)) {
    return new NextResponse(
      JSON.stringify({ error: "Forbidden" }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          "X-Security-Block": "ua",
        },
      }
    );
  }

  const isApiRoute = pathname.startsWith(API_PATH_PREFIX);
  const { windowMs, maxRequests } = isApiRoute
    ? RATE_LIMIT_CONFIG.api
    : RATE_LIMIT_CONFIG.page;
  const store = isApiRoute ? apiRateLimitStore : pageRateLimitStore;

  const { allowed, remaining, resetAt } = checkRateLimit(ip, store, windowMs, maxRequests);

  if (!allowed) {
    const retryAfterSec = Math.ceil((resetAt - Date.now()) / 1000);
    return new NextResponse(
      JSON.stringify({ error: "Too Many Requests", retryAfter: retryAfterSec }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(maxRequests));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)",
  ],
};

