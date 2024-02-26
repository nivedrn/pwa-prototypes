# Use the official Node.js LTS image as the base image
FROM node:lts-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code to the container
COPY . .

# Build the Next.js application
RUN npm run build

# Use a lightweight Node.js image for the production environment
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the built application from the previous stage to the container
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules

# Expose the port that the Next.js application will run on
EXPOSE 8000

# Define the command to start the Next.js application
CMD ["npm", "start"]