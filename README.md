# Boilermeets Local Setup Documentation

## Database Setup
```
docker run --name boilermeets-local -e POSTGRES_PASSWORD=<PASSWORD> -p 5432:5432 -d postgres:latest
```

Add to `.env` in server
```
DATABASE_URL="postgresql://postgres:<PASSWORD>@localhost:5432"
```

Database Migrations

Generating SQL Migration files
```
npx drizzle-kit generate
```

Applying Migrations
```
npx drizzle-kit migrate
```

Environment Variables Needed
```
PORT=<VALID_HTTP_PORT>
BETTER_AUTH_SECRET=<RANDOM_UUID>
BETTER_AUTH_URL="http://localhost:3000"
```

Running the server in dev mode
```
npm run dev
```