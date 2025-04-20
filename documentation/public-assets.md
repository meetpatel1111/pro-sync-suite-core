# Public Assets Documentation

This document describes the contents of the `/public` folder, which contains static assets that are publicly accessible and served as-is by the web server.

## How the `/public` Folder Works
- Files in `/public` are served at the root URL of your application (e.g., `/favicon.ico`).
- This folder is ideal for static files that do not require processing or bundling.

## Folder Contents

- **favicon.ico**: The icon shown in browser tabs and bookmarks.
- **placeholder.svg**: A placeholder SVG image used in the UI or as a fallback.
- **robots.txt**: Provides instructions to search engine crawlers about which pages to index or avoid.

## Best Practices
- Place only static, non-sensitive files in `/public`.
- Reference these files directly in your HTML or via URLs.

---

For more on asset management, see the main `README.md` and your build tool documentation.
