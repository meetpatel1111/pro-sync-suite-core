
# Deployment Guide

This guide covers deploying ProSync Suite to production environments.

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Domain name (optional)
- SSL certificate (for custom domains)

## Environment Setup

### Production Environment Variables

Create a `.env.production` file:

```bash
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Supabase Configuration

1. **Create Production Project**
   ```bash
   # Initialize Supabase
   npx supabase init
   
   # Link to production project
   npx supabase link --project-ref your-project-ref
   ```

2. **Deploy Database Schema**
   ```bash
   # Push migrations
   npx supabase db push
   
   # Deploy Edge Functions
   npx supabase functions deploy
   ```

3. **Configure Authentication**
   - Enable required auth providers
   - Set up email templates
   - Configure redirect URLs

## Build Process

### Production Build

```bash
# Install dependencies
npm ci

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Preview build (optional)
npm run preview
```

### Build Optimization

The build process includes:
- Code splitting for optimal loading
- Tree shaking to remove unused code
- Asset optimization and minification
- Service worker for offline functionality

## Deployment Options

### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### 2. Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. AWS S3 + CloudFront

```bash
# Build
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 4. Docker Deployment

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
  listen 80;
  server_name localhost;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass https://your-supabase-url.supabase.co/functions/v1/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## Custom Domain Setup

### 1. DNS Configuration

Add these DNS records:
```
Type: A
Name: @
Value: [your-hosting-ip]

Type: CNAME
Name: www
Value: your-domain.com
```

### 2. SSL Certificate

**Using Let's Encrypt (Certbot)**:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

**Using Cloudflare**:
- Enable Cloudflare proxy
- Set SSL/TLS mode to "Full (strict)"
- Enable "Always Use HTTPS"

## Security Configuration

### 1. Content Security Policy

Add CSP headers:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data: https:;
               connect-src 'self' https://*.supabase.co;">
```

### 2. Security Headers

Configure security headers:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Performance Optimization

### 1. Caching Strategy

```nginx
# Static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# API responses
location /api/ {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### 2. Compression

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## Monitoring and Logging

### 1. Application Monitoring

Configure monitoring with:
- **Sentry** for error tracking
- **Google Analytics** for usage analytics
- **Supabase Analytics** for database metrics

```typescript
// Sentry configuration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

### 2. Health Checks

Implement health check endpoint:
```typescript
// /api/health endpoint
export default function health() {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Backup and Recovery

### 1. Database Backups

```bash
# Automated daily backups
npx supabase db dump > backup-$(date +%Y%m%d).sql

# Restore from backup
psql -h your-db-host -U postgres -d postgres < backup.sql
```

### 2. File Storage Backups

Configure regular backups for Supabase Storage buckets.

## Rollback Strategy

### 1. Quick Rollback

```bash
# Vercel rollback
vercel --prod --rollback

# Manual rollback
git revert HEAD
git push origin main
```

### 2. Database Rollback

```bash
# Rollback specific migration
npx supabase migration repair --status reverted 20240101000000

# Apply previous migration
npx supabase db reset
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] CDN configured
- [ ] Monitoring enabled
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Performance optimization applied
- [ ] Health checks working
- [ ] CI/CD pipeline configured

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify environment variables
   - Clear npm cache: `npm cache clean --force`

2. **Database Connection**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure proper authentication

3. **Performance Issues**
   - Enable compression
   - Optimize images
   - Implement proper caching
   - Use CDN for static assets

For additional support, contact the development team or refer to platform-specific documentation.
