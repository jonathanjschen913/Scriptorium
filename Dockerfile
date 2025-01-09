# Use a base image with multiple languages installed
FROM ubuntu:20.04

# Set environment variable to avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies for multiple programming languages
RUN apt-get update && apt-get install -y \
    gcc \             
    g++ \              
    openjdk-17-jdk \    
    python3 \          
    python3-pip \     
    curl \            
    nano \             
    ruby \             
    golang \           
    rustc \            
    php \              
    perl \             
    r-base \           
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# Create and set permissions for the /code directory (used for temporary code files)
RUN mkdir -p /code && chmod -R 777 /code

# Copy local project files to the container (optional if the container runs your app)
COPY . .

# Install dependencies for Node.js if your app requires them
RUN if [ -f package.json ]; then npm install; fi

# Set the default working directory to /code for code execution
WORKDIR /code

# Default command to keep the container running (optional for debugging)
CMD ["tail", "-f", "/dev/null"]
