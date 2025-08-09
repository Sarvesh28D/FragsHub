FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install all deps (including dev) to build TypeScript when needed
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build if a build script exists; ignore errors if not needed
RUN npm run build || echo "Skipping build"

FROM node:18-alpine AS runner
WORKDIR /app
# Install only production deps for smaller image
COPY package*.json ./
RUN npm ci --omit=dev
# Copy source and any build outputs
COPY --from=builder /app/. .

ENV PORT=3001
EXPOSE 3001
CMD ["npm", "start"]
