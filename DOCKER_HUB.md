# LoginFirewall Docker Image (lassekathke/loginfirewall)

A production-ready Next.js app with credentials login, TOTP, Passkeys/WebAuthn, and optional Zoraxy IP whitelisting.

- Image: `lassekathke/loginfirewall`
- Exposes: `3000`
- Default admin: `admin` / `admin123` (change after first login)

## docker-compose (app only)
```yaml
version: "3.9"
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      NEXTAUTH_URL: https://YOUR-DOMAIN.com
      NEXTAUTH_SECRET: changeme-super-secret-key
      DATABASE_URL: "file:./prisma/dev.db"
      ZORAXY_API_URL: https://zoraxy
      ZORAXY_USERNAME: admin
      ZORAXY_PASSWORD: admin
      TOTP_ISSUER: LoginFirewall
      PASSKEY_ORIGIN: https://YOUR-DOMAIN.com
      PASSKEY_RP_ID: localhost
      PASSKEY_RP_NAME: LoginFirewall
    volumes:
      - app-data:/app/prisma
    command: sh -c "npx prisma migrate deploy && npm run start"
```

## docker-compose (app + Zoraxy)
```yaml
version: "3.9"
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      NEXTAUTH_URL: https://YOUR-DOMAIN.com
      NEXTAUTH_SECRET: changeme-super-secret-key
      DATABASE_URL: "file:./prisma/dev.db"
      ZORAXY_API_URL: https://zoraxy
      ZORAXY_USERNAME: admin
      ZORAXY_PASSWORD: admin
      TOTP_ISSUER: LoginFirewall
      PASSKEY_ORIGIN: https://YOUR-DOMAIN.com
      PASSKEY_RP_ID: localhost
      PASSKEY_RP_NAME: LoginFirewall
    volumes:
      - app-data:/app/prisma
    command: sh -c "npx prisma migrate deploy && npm run start"

  zoraxy:
    image: zoraxy/zoraxy:latest
    container_name: zoraxy
    ports:
      - "8000:8000"
```

## Notes
- Set a strong `NEXTAUTH_SECRET`.
- Adjust `DATABASE_URL` for production (e.g., PostgreSQL).
- `PASSKEY_ORIGIN/RP_ID/RP_NAME` must match your site domain for WebAuthn.
- Zoraxy must have its API enabled; app uses cookie/CSRF auth with `Zoraxy` and `zoraxy_csrf`.
