FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY .env .env

# Install dependencies
WORKDIR /app/backend
RUN npm install --production

# Copy application files
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "backend/server.js"]
