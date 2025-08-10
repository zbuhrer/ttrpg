# Use a Node.js image as the base
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# to leverage Docker cache for dependencies
COPY package*.json . /app/

# Install PostgreSQL client for database health checks
RUN apk add --no-cache postgresql-client

# Install all dependencies, including dev dependencies, needed for the dev server
RUN npm install

# Copy the rest of the application code
COPY . /app/

# Make startup script executable
RUN chmod +x /app/scripts/startup.sh

# Expose the ports the client (Vite default) and server (Express) will run on
EXPOSE 5173
EXPOSE 3000

# Command to run the application in development mode using the combined dev script
CMD ["npm", "run", "dev"]
