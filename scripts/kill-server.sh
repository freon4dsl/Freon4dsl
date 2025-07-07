#!/usr/bin/env bash
if [[ -z "${NODE_PORT}" ]]; then
  PORT="8001"
else
  PORT="${NODE_PORT}"
fi

pid=$(lsof -i4TCP:$PORT -Fp | grep ^p | sed "s/p//")
kill $pid

# on windows use:
# taskkill /PID process-id /F
# find process-id via the command:
# netstat -ano | findstr :8001
