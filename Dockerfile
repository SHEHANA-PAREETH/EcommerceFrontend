# Use the official Node.js 16 Alpine image for the build stage
FROM node:alpine3.18 as build
# Build app
WORKDIR /app
COPY package*.json .
RUN npm install

COPY . .
# Set the REACT_APP_API_URL environment variable
ENV REACT_APP_BASE_URL=http://13.48.123.137:5000
RUN npm run build

# Use the official Nginx 1.22 Alpine image for serving the app
FROM nginx:1.23-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /app/build .
# Copy the custom nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]

