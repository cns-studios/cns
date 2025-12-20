# Use an official Node.js runtime as the base image
FROM node:22

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

COPY public/ ./public/
COPY server.js .
COPY database.js .
COPY .env .

# Expose the port the app runs on (e.g., 3000)
EXPOSE 8080

# Command to run the application
CMD ["node", "server.js"]

