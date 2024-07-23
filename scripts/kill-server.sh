#!/usr/bin/env bash
if [[ -z "${NODE_PORT}" ]]; then
  PORT="8001"
else
  PORT="${NODE_PORT}"
fi

pid=$(lsof -i4TCP:$PORT -Fp | grep ^p | sed "s/p//")
kill $pid
