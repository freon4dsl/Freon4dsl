#!/bin/bash

# Replace 8000 with your port number
PORT=8001

# Find the process using the specified port and kill it
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
    kill $PID
    echo "Process on port $PORT has been stopped."
else
    echo "No process found on port $PORT."
fi