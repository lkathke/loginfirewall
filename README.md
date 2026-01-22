# LoginFirewall – Auth, TOTP, Passkeys & Zoraxy Whitelisting

A Next.js app for user management, Zoraxy IP whitelisting, TOTP, and Passkeys/WebAuthn.

## Features
- 🔑 Credentials login (NextAuth) with optional TOTP
- 🛡️ Passkeys/WebAuthn for passwordless login
- 🧭 Admin panel for users, groups, links
- 🌐 Automatic IP whitelisting in Zoraxy (24h) with cleanup job
- 🎨 Modern UI (Tailwind v4, Framer Motion)

## Requirements
- Node.js 18+
- SQLite (default) or any Prisma-compatible DB
- Zoraxy Proxy Manager with API enabled (for whitelisting)

## Quick Start
1) Copy env: `cp .env.example .env` and fill `NEXTAUTH_SECRET`, `ZORAXY_*`, `PASSKEY_*`, `TOTP_ISSUER`, `DATABASE_URL`.
2) Install deps: `npm install`
3) Prisma: `npx prisma generate && npx prisma migrate dev`
4) Seed admin: `npm run prisma:seed` or `npx ts-node prisma/seed.ts`
5) Dev server: `npm run dev` (http://localhost:3000)
6) Default admin: `admin` / `admin123` (change after first login)

## Authentication
- **TOTP**: Enable in Profile/Admin (QR stays available). Once verified, a 6-digit OTP is required at login.
- **Passkeys**: Register in Profile/Admin. The login page has “Sign in with Passkey”. Adjust `PASSKEY_ORIGIN`, `PASSKEY_RP_ID`, `PASSKEY_RP_NAME` to match your domain.
- **Credentials**: Username/password; if TOTP is enabled, user must also provide the OTP.

## Zoraxy Integration (Cookies & CSRF)
- Uses `Zoraxy` + `zoraxy_csrf` cookies; `x-csrf-token` is read from `<meta name="zoraxy.csrf.Token">`.
- Requests are `application/x-www-form-urlencoded`; auto re-login on 401/403.
- Required vars: `ZORAXY_API_URL`, `ZORAXY_USERNAME`, `ZORAXY_PASSWORD`.

## Database
- Default: SQLite (`DATABASE_URL="file:./dev.db"`).
- Production: PostgreSQL recommended; run `npx prisma migrate deploy` in CI/container.

## Docker

The image is available on Docker Hub: `lassekathke/loginfirewall:latest`

### Docker Run (Quick Start)

```bash
docker run -d \
  --name loginfirewall \
  -p 3000:3000 \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e NEXTAUTH_SECRET=changeme-super-secret-key \
  -e DATABASE_URL="file:./prisma/dev.db" \
  -e ZORAXY_API_URL=http://localhost:8000 \
  -e ZORAXY_USERNAME=admin \
  -e ZORAXY_PASSWORD=admin \
  -e TOTP_ISSUER=LoginFirewall \
  -e PASSKEY_ORIGIN=http://localhost:3000 \
  -e PASSKEY_RP_ID=localhost \
  -e PASSKEY_RP_NAME=LoginFirewall \
  -v loginfirewall-data:/app/prisma \
  lassekathke/loginfirewall:latest \
  sh -c "npx prisma migrate deploy && npm run start"
```

### Docker Compose (App Only)

```yaml
version: "3.9"
services:
  app:
    image: lassekathke/loginfirewall:latest
    container_name: loginfirewall
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: changeme-super-secret-key
      DATABASE_URL: "file:./prisma/dev.db"
      ZORAXY_API_URL: http://localhost:8000
      ZORAXY_USERNAME: admin
      ZORAXY_PASSWORD: admin
      TOTP_ISSUER: LoginFirewall
      PASSKEY_ORIGIN: http://localhost:3000
      PASSKEY_RP_ID: localhost
      PASSKEY_RP_NAME: LoginFirewall
    volumes:
      - app-data:/app/prisma
    command: sh -c "npx prisma migrate deploy && npm run start"

volumes:
  app-data:
```

### Docker Compose (App + Zoraxy)

```yaml
version: "3.9"
services:
  app:
    image: lassekathke/loginfirewall:latest
    container_name: loginfirewall
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: changeme-super-secret-key
      DATABASE_URL: "file:./prisma/dev.db"
      ZORAXY_API_URL: http://zoraxy:8000
      ZORAXY_USERNAME: admin
      ZORAXY_PASSWORD: admin
      TOTP_ISSUER: LoginFirewall
      PASSKEY_ORIGIN: http://localhost:3000
      PASSKEY_RP_ID: localhost
      PASSKEY_RP_NAME: LoginFirewall
    volumes:
      - app-data:/app/prisma
    command: sh -c "npx prisma migrate deploy && npm run start"
    depends_on:
      - zoraxy

  zoraxy:
    image: zoraxy/zoraxy:latest
    container_name: zoraxy
    ports:
      - "8000:8000"
    volumes:
      - zoraxy-data:/opt/zoraxy/config

volumes:
  app-data:
  zoraxy-data:
```

Run with:
```bash
docker compose up -d
# or with Zoraxy:
docker compose -f docker-compose.zoraxy.yml up -d
```

## CI/CD
- GitHub Actions workflow publishes Docker image to Docker Hub. Required secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

## Production Tips
- Set a strong `NEXTAUTH_SECRET` (`openssl rand -base64 32`).
- Set `NEXTAUTH_URL` to the real domain.
- Enforce HTTPS (reverse proxy).
- Change seeded admin password immediately.
- Backup DB/volumes.

## Troubleshooting
- Zoraxy 403: check cookies/CSRF and `ZORAXY_*` values.
- Passkey fails: Origin/RP-ID must match your domain; inspect browser console.
- TOTP invalid: check device time/zone; regenerate QR.

## License
MIT
