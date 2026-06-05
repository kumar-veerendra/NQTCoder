FROM node:20-bullseye

# Install system compilers (g++, python3, default-jdk)
RUN apt-get update && apt-get install -y \
    g++ \
    python3 \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

# Create python command alias
RUN ln -sf /usr/bin/python3 /usr/local/bin/python

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port (Render sets PORT env, but 5000 is our default)
EXPOSE 5000

# Start command
CMD ["node", "server.js"]
