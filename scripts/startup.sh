#!/bin/sh

echo "🚀 Starting Aetherquill application..."

# Wait for database to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h db -p 5432 -U user; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:push

if [ $? -eq 0 ]; then
  echo "✅ Database migrations completed successfully!"
else
  echo "❌ Database migrations failed!"
  exit 1
fi

# Start the application
echo "🎮 Starting Aetherquill server..."
exec npm run dev
