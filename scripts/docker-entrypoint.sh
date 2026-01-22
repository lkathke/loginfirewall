#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database (if needed)..."
npx prisma db seed || echo "Seed skipped or already exists"

echo "Starting Next.js server..."
exec npm run start
