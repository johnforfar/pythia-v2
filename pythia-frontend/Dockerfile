# Install dependencies only when needed
FROM node:18-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# RUN npm run format # Removed as script doesn't exist
RUN npm run build
RUN ls -la /app/.next

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED 1 # Optional: to disable telemetry in the runner

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Removed COPY for .next/static as standalone should handle it

# Switch to the non-root user
USER nextjs

EXPOSE 3111

# Command to run the standalone server
# Note: The entrypoint might be server.js in the standalone folder
CMD ["node", "server.js"] 