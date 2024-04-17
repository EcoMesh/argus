# Use the official Node.js runtime as the base image
FROM node:20 AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN yarn

# Copy the entire application code to the container
COPY . .

# Build the React app for production
RUN yarn build

# Use Nginx as the production server
FROM nginx:alpine

# Copy the built React app to Nginx's web server directory
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container runs

# HEALTHCHECK --interval=30s --timeout=3s \ 
#     CMD wget -f http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]