# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pass environment variables for build
ARG MONGODB_URL
ARG JWT_SECRET
ARG Refresh_Key
ARG GMAIL
ARG PASSWORD
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_API_KEY
ARG CLOUDINARY_API_SECRET
ARG STRIPE_PUBLISH_KEY
ARG STRIPE_SECRET_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISH_KEY
ARG GROQ_API_KEY
ARG ADMIN_EMAIL
ARG ADMIN_PASSWORD
ARG UPSTASH_REDIS_REST_URL
ARG UPSTASH_REDIS_REST_TOKEN
ARG app_id
ARG key
ARG secret
ARG cluster
ARG NEXT_PUBLIC_PUSHER_KEY
ARG NEXT_PUBLIC_PUSHER_CLUSTER

ENV MONGODB_URL=$MONGODB_URL \
    JWT_SECRET=$JWT_SECRET \
    Refresh_Key=$Refresh_Key \
    GMAIL=$GMAIL \
    PASSWORD=$PASSWORD \
    NEXTAUTH_URL=$NEXTAUTH_URL \
    NEXTAUTH_SECRET=$NEXTAUTH_SECRET \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
    CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME \
    CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY \
    CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET \
    STRIPE_PUBLISH_KEY=$STRIPE_PUBLISH_KEY \
    STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY \
    NEXT_PUBLIC_STRIPE_PUBLISH_KEY=$NEXT_PUBLIC_STRIPE_PUBLISH_KEY \
    GROQ_API_KEY=$GROQ_API_KEY \
    ADMIN_EMAIL=$ADMIN_EMAIL \
    ADMIN_PASSWORD=$ADMIN_PASSWORD \
    UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL \
    UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN \
    app_id=$app_id \
    key=$key \
    secret=$secret \
    cluster=$cluster \
    NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY \
    NEXT_PUBLIC_PUSHER_CLUSTER=$NEXT_PUBLIC_PUSHER_CLUSTER

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Stage 3: Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
