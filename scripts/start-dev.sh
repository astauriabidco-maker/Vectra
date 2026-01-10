#!/bin/bash

# Configuration
PROJECT_DIR="/Users/franklintchakounteu/.gemini/antigravity/scratch/Vectra"
LOG_FILE="$PROJECT_DIR/dev-startup.log"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "Starting Vectra Development Environment..."

# Ensure we are in the project directory
cd "$PROJECT_DIR" || { log "Failed to change directory to $PROJECT_DIR"; exit 1; }

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log "Docker is not running. Attempting to start Docker..."
    open -a Docker
    # Wait for Docker to initialize
    while ! docker info > /dev/null 2>&1; do
        log "Waiting for Docker to start..."
        sleep 5
    done
    log "Docker started successfully."
else
    log "Docker is already running."
fi

# Start Infrastructure (Postgres, Redis)
log "Starting Docker containers..."
/usr/local/bin/docker-compose up -d
if [ $? -eq 0 ]; then
    log "Docker containers started."
else
    log "Failed to start Docker containers."
    exit 1
fi

# Start Application (Backend + Frontend)
log "Starting Application via 'npm run dev'..."
# We use nohup to keep it running if this script exits, though launchd usually handles the process lifecycle.
# For launchd, we usually want the process to stay in the foreground if possible, 
# but 'npm run dev' spawns subprocesses. 
# Here we will just run it. The output is redirected to the log.

export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
npm run dev >> "$LOG_FILE" 2>&1
