# LoginFirewall – Auth & Whitelisting mit TOTP & Passkeys

Eine Next.js-Anwendung für Benutzerverwaltung, Zoraxy-IP-Whitelisting, TOTP, sowie Passkey/WebAuthn-Login.

## Features
- 🔑 Login mit Credentials (NextAuth) und optional TOTP
- 🛡️ Passkeys/WebAuthn für passwortlosen Login
- 🧭 Admin-Panel für Nutzer, Gruppen, Links
- 🌐 Automatisches IP-Whitelisting in Zoraxy (24h) inkl. Auto-Cleanup
- 🎨 Modernes UI (Tailwind v4, Framer Motion)

## Voraussetzungen
- Node.js 18+
- SQLite (Standard) oder jede Prisma-kompatible DB
- Zoraxy Proxy Manager mit aktiver API (für Whitelisting)

## Schnellstart
1) `cp .env.example .env` anpassen (NEXTAUTH_SECRET, ZORAXY*, PASSKEY_*, TOTP_ISSUER, DATABASE_URL).
2) Dependencies: `npm install`
3) Prisma vorbereiten: `npx prisma generate && npx prisma migrate dev`
4) Seed (Admin-User): `npm run prisma:seed` oder `npx ts-node prisma/seed.ts`
5) Dev-Server: `npm run dev` (http://localhost:3000)
6) Standard-Admin: `admin` / `admin123` (nach erstem Login ändern)

## Authentifizierung
- **TOTP**: Im Profil/Admin QR anzeigen, Code verifizieren, danach ist OTP beim Login Pflicht. QR bleibt abrufbar.
- **Passkeys**: Im Profil/Admin registrieren. Login-Seite hat „Mit Passkey anmelden“. RP-Werte über `PASSKEY_ORIGIN`, `PASSKEY_RP_ID`, `PASSKEY_RP_NAME`.
- **Credentials**: Username/Passwort; bei aktiviertem TOTP wird zusätzlich der 6-stellige Code verlangt.

## Zoraxy-Integration (Cookies & CSRF)
- Verteilt Cookies `Zoraxy` und `zoraxy_csrf`; CSRF-Header `x-csrf-token` wird aus `<meta name="zoraxy.csrf.Token">` gelesen.
- Requests sind `application/x-www-form-urlencoded`; bei 401/403 wird automatisch neu eingeloggt.
- Erforderliche Variablen: `ZORAXY_API_URL`, `ZORAXY_USERNAME`, `ZORAXY_PASSWORD`.

## Datenbank
- Standard: SQLite unter `DATABASE_URL="file:./dev.db"`.
- Produktion: PostgreSQL empfohlen; `npx prisma migrate deploy` im CI/Container ausführen.

## Docker
- **Dockerfile**: Baut Next.js und startet auf Port 3000.
- **docker-compose.yml**: Nur App, nutzt das Image `lassekathke/loginfirewall` mit vordefinierten Env-Defaults; läuft `npx prisma migrate deploy && npm run start`.
- **docker-compose.zoraxy.yml**: App + Zoraxy (Port 8000), App zeigt auf `http://zoraxy:8000`, Image `lassekathke/loginfirewall`.

Start:
```
docker compose up --build           # nur App
docker compose -f docker-compose.zoraxy.yml up --build  # App + Zoraxy
```

## Produktionstipps
- Starkes `NEXTAUTH_SECRET` setzen (`openssl rand -base64 32`).
- `NEXTAUTH_URL` auf die echte Domain stellen.
- HTTPS erzwingen (Reverse Proxy).
- Seed-Admin danach sofort ändern.
- Backups für DB/Volumes.

## Troubleshooting
- Zoraxy 403: Cookies/CSRF prüfen, `ZORAXY_*` Variablen kontrollieren.
- Passkey schlägt fehl: Origin/RP-ID müssen Domain matchen; Browser-Konsole checken.
- TOTP ungültig: Uhrzeit/Zeitzone prüfen, neuen QR laden.

## Lizenz
MIT
