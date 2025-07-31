#!/bin/bash

# LeetVibe Backend Deployment Script
echo "Starting LeetVibe Backend deployment..."

# Set environment variables
export AZURE_OPENAI_API_KEY="${AZURE_OPENAI_API_KEY}"

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Build and start the application
echo "Building and starting LeetVibe Backend..."
docker-compose up -d --build

# Show container status
echo "Container status:"
docker-compose ps

echo "LeetVibe Backend deployment completed!"
echo "Backend should be accessible at http://localhost:5000"
