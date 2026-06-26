#!/bin/bash

echo "Deteniendo servicios de Indy Wallet..."

kill_by_port() {
    local port=$1
    local pid
    pid=$(lsof -t -i :"$port" 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "  -> Puerto $port (PID: $pid)..."
        kill "$pid" 2>/dev/null
        sleep 1
    fi
}

kill_by_port 8080
kill_by_port 5173

echo "Listo."
