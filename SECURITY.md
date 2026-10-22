# Security

## Security Policy

Please see [Security Policy](https://github.com/your-org/arbol-gen-pro/security/policy) for more information.

## Data Protection

This application handles sensitive family genealogy data. The following security measures are in place:

### Client-Side Security

- All data is stored locally in IndexedDB via Dexie.js
- No user data is sent to external services without explicit consent
- Photos are compressed and optimized in the browser before storage

### Backend Security

- Supabase Auth for authentication
- Row Level Security (RLS) policies for database access
- Edge Functions validate identity and authorization before generating R2 URLs

### Environment Variables

- Never commit `.env` files to version control
- `.env` is listed in `.gitignore`
- Use `VITE_` prefix only for client-safe variables
- Server-side secrets use `service_role` key (never exposed to browser)

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it responsibly by:
1. Emailing security@arbol-gen-pro.com
2. Opening a private issue if your GitHub plan supports it

We will acknowledge receipt within 48 hours and will work with you to
understand the issue and prepare a fix.

## Current Known Considerations

- OPENROUTER_API_KEY in .env is for future AI features and should be
  migrated to a server-side only key before any AI features are implemented
- Cloudflare R2 bucket is private; browser never receives R2 credentials
- All R2 URLs are signed and have short expiration (15 minutes)