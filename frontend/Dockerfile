FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy application files
COPY . .

# Build Nuxt application
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start Nuxt in production mode
CMD ["node", ".output/server/index.mjs"]
