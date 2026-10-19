import type { NextConfig } from 'next';
const developmentEval = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
if (process.env.VERCEL && !backendUrl.startsWith('https://')) {
  throw new Error('BACKEND_URL must be an explicit HTTPS URL on Vercel');
}
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${developmentEval} https://www.paypal.com https://www.paypalobjects.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.paypal.com https://*.paypalobjects.com",
  "connect-src 'self' https://*.paypal.com",
  "frame-src https://*.paypal.com",
  "form-action 'self' https://*.paypal.com",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'"
].join('; ');
const config: NextConfig = {
  devIndicators: false,
  async rewrites() { return [{ source: '/api/:path*', destination: `${backendUrl}/:path*` }]; },
  async headers() { return [{ source: '/:path*', headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Content-Security-Policy', value: csp }
  ] }]; }
};
export default config;
