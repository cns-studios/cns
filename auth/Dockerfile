# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock, etc.)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application's source code from your host to your image filesystem.
COPY . .

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Run the app when the container launches
CMD ["node", "server.js"]
