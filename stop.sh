#!/bin/bash

echo "Deteniendo servicios de Indy Wallet..."

kill_by_port() {
    local port=$1
    local pids
    pids=$(lsof -t -i :"$port" 2>/dev/null)
    if [ -n "$pids" ]; then
        for pid in $pids; do
            echo "  -> Puerto $port (PID: $pid)..."
            kill "$pid" 2>/dev/null
        done
        sleep 2
        # Force kill if still running
        for pid in $pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null
            fi
        done
    fi
}

kill_by_port 8080
kill_by_port 5173

echo "Listo."
