#!/bin/bash

cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    echo "Listo."
    exit 0
}

trap cleanup SIGINT SIGTERM

# --- Backend ---
BACKEND_JAR="indy-project/indy-backend/target/wallet-0.0.1-SNAPSHOT.jar"
if [ -f "$BACKEND_JAR" ]; then
    echo "==> Arrancando backend (Spring Boot - JAR)..."
    java -Dspring.profiles.active=local -jar "$BACKEND_JAR" &
    BACKEND_PID=$!
else
    echo "==> Arrancando backend (Spring Boot - Maven)..."
    (cd indy-project/indy-backend && ./mvnw spring-boot:run -DskipTests -Dspring-boot.run.profiles=local) &
    BACKEND_PID=$!
fi

# --- Frontend ---
lsof -ti :5173 2>/dev/null | xargs kill 2>/dev/null
sleep 1

echo "==> Arrancando frontend (Expo)..."
cd indy-project/indy-frontend && npx expo start --web --port 5173 &
FRONTEND_PID=$!
cd "$OLDPWD" 2>/dev/null || true

echo ""
echo "Backend PID:  $BACKEND_PID  (http://localhost:8080)"
echo "Frontend PID: $FRONTEND_PID  (http://localhost:5173)"
echo ""
echo "Presiona Ctrl+C para detener ambos."

wait
