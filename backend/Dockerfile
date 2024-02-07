# Use the official Node.js 14 image as a parent image
FROM node:21

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) into the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's code into the container
COPY . .

# Make port 3001 available outside of this container
EXPOSE 3001

# Run your application when the container launches
CMD ["node", "server.js"]
