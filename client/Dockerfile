# Use Node.js version 20
FROM node:20 as builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Use a lightweight static server for production
FROM node:20 as production

# Install serve globally
RUN npm install -g serve

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the built files from the previous stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port for the static server
EXPOSE 3000

# Command to serve the built assets
CMD ["serve", "-s", "dist", "-l", "3000"]
