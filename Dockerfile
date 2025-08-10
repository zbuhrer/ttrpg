# Use a Node.js image as the base
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# to leverage Docker cache for dependencies
COPY package*.json . /app/

# Install PostgreSQL client for database migrations
RUN apk add --no-cache postgresql-client


# Install all dependencies, including dev dependencies, needed for the dev server
RUN npm install

# Copy the rest of the application code
COPY . /app/



# Expose the ports the client (Vite default) and server (Express) will run on
EXPOSE 5173
EXPOSE 3000

# Command to run the application using the startup script
CMD ["sh", "/app/scripts/startup.sh"]
