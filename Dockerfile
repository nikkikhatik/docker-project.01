FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Final Production Image
FROM node:18-alpine AS runner
WORKDIR /app

# Non-root user for security
USER node

# Copy dependencies and source code
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 3000

ENV PORT=3000

CMD ["node", "app.js"]
