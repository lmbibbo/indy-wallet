#!/bin/bash

cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    echo "Listo."
    exit 0
}

# --- Backend ---
BACKEND_JAR="indy-project/indy-backend/target/wallet-0.0.1-SNAPSHOT.jar"
if [ -f "$BACKEND_JAR" ]; then
    echo "==> Arrancando backend (Spring Boot - JAR)..."
    java -jar "$BACKEND_JAR" &
    BACKEND_PID=$!
else
    echo "==> Arrancando backend (Spring Boot - Maven)..."
    (cd indy-project/indy-backend && ./mvnw spring-boot:run -DskipTests) &
    BACKEND_PID=$!
fi

# --- Frontend ---
if lsof -i :5173 >/dev/null 2>&1; then
    echo "==> Puerto 5173 ocupado, matando proceso anterior..."
    kill "$(lsof -t -i :5173)" 2>/dev/null
    sleep 1
fi

echo "==> Arrancando frontend (Vite)..."
(cd indy-project/indy-frontend && npm run dev) &
FRONTEND_PID=$!

trap cleanup SIGINT SIGTERM

echo ""
echo "Backend PID:  $BACKEND_PID  (http://localhost:8080)"
echo "Frontend PID: $FRONTEND_PID  (http://localhost:5173)"
echo ""
echo "Presiona Ctrl+C para detener ambos."

wait
