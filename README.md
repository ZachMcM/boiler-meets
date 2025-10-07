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
In server/.env
```
PORT=<VALID_HTTP_PORT>
BETTER_AUTH_SECRET=<RANDOM_UUID>
BETTER_AUTH_URL="http://localhost:3000"
EMAIL_USER="ibtemp99@gmail.com"
GOOGLE_APP_PASSWORD=<ASK IAN FOR THIS>
```
Note that EMAIL_USER is subject to change to a different google account

In client/.env
```
VITE_SERVER_URL="http://localhost:<SERVER_PORT>"
```
(SERVER_PORT should be the same valid HTTP port assigned in the server/.env variable PORT)

Ensure nodemon and ts-node are installed on your system
```
npm install -g nodemon
npm install -g ts-node
```

Run 'npm install' in a terminal in both the server and client to install the necessary packages before running the server or client.

Running the server in dev mode
```
npm run dev
```

Running the client
```
npm run start
```
