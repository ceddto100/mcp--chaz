# Use an official lightweight Node.js image
FROM node:20-slim

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of the application source code
COPY . .

# Expose the port the app runs on (should match the PORT in .env or default)
EXPOSE 8080

# Define the command to run the application
CMD [ "node", "server.js" ]
