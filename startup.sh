#!/bin/bash
set -e
# Install npm packages
npm install
npm install bcrypt
npm install jsonwebtoken

# Create .env file
cat <<EOL > .env
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

BCRYPT_SALT_ROUNDS=10
TOKEN_SECRET="aasdlaijsl12u3kjldsad"
REFRESH_TOKEN_SECRET="dfgjfkdlghlk3h24klansdlkj"
TOKEN_EXPIRES_IN="1h"
REFRESH_TOKEN_EXPIRES_IN="7d"
EOL

# init database work
npm i prisma @prisma/client @prisma/studio
npx prisma init
npx prisma generate
npx prisma migrate dev

# Build Docker image
docker build -t pp2 .

# Run Docker container
docker-compose up