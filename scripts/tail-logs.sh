#!/bin/bash

# Aetherquill Log Tailing Script
# This script helps you tail the application logs easily

LOGS_DIR="$(dirname "$0")/../logs"
LOG_FILE="$LOGS_DIR/app.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOGS_DIR"

# Function to display usage
usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -f, --follow    Follow log output (like tail -f)"
    echo "  -n, --lines N   Show last N lines (default: 50)"
    echo "  -h, --help      Show this help message"
    echo "  --clear         Clear the current log file"
    echo "  --rotate        Force log rotation"
    echo ""
    echo "Examples:"
    echo "  $0                    # Show last 50 lines"
    echo "  $0 -f                 # Follow logs in real-time"
    echo "  $0 -n 100             # Show last 100 lines"
    echo "  $0 -f -n 20           # Follow logs, starting with last 20 lines"
    echo "  $0 --clear            # Clear current log file"
}

# Default values
FOLLOW=false
LINES=50
CLEAR=false
ROTATE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        --clear)
            CLEAR=true
            shift
            ;;
        --rotate)
            ROTATE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Clear log file if requested
if [[ "$CLEAR" == "true" ]]; then
    echo "Clearing log file: $LOG_FILE"
    > "$LOG_FILE"
    echo "Log file cleared."
    exit 0
fi

# Force log rotation if requested
if [[ "$ROTATE" == "true" ]]; then
    if [[ -f "$LOG_FILE" ]]; then
        TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
        ROTATED_FILE="${LOG_FILE%.log}_${TIMESTAMP}.log"
        mv "$LOG_FILE" "$ROTATED_FILE"
        echo "Log file rotated to: $ROTATED_FILE"
        touch "$LOG_FILE"
        echo "New log file created: $LOG_FILE"
    else
        echo "No log file found to rotate."
    fi
    exit 0
fi

# Check if log file exists
if [[ ! -f "$LOG_FILE" ]]; then
    echo "Log file not found: $LOG_FILE"
    echo "Make sure the server is running to generate logs."
    exit 1
fi

# Display log file info
echo "=== Aetherquill Logs ==="
echo "Log file: $LOG_FILE"
echo "File size: $(du -h "$LOG_FILE" | cut -f1)"
echo "Last modified: $(stat -c %y "$LOG_FILE" 2>/dev/null || stat -f %Sm "$LOG_FILE" 2>/dev/null || echo "Unknown")"
echo "========================="
echo ""

# Tail the logs
if [[ "$FOLLOW" == "true" ]]; then
    echo "Following logs (press Ctrl+C to exit)..."
    tail -f -n "$LINES" "$LOG_FILE"
else
    echo "Showing last $LINES lines..."
    tail -n "$LINES" "$LOG_FILE"
fi
