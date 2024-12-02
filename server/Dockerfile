# Use Node.js version 20
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only the package.json and package-lock.json first
COPY package*.json ./
RUN rm -rf node_modules package-lock.json
# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the server
RUN npm run build

# Expose the port the server will run on
EXPOSE 3080

# Command to run the server
CMD ["node", "dist/server.js"]