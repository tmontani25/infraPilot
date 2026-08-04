#!/usr/bin/env bash
# Installe les dépendances (si besoin) et lance tout le stack infraPilot en local :
# worker-openstack (8000), worker-opentofu (8010), worker-ansible (8020), api (4000), frontend-v2 (5173)
#
# Usage : ./scripts/dev-up.sh
# Ctrl+C arrête tous les services proprement.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

info()  { echo -e "\033[1;34m[dev-up]\033[0m $1"; }
warn()  { echo -e "\033[1;33m[dev-up]\033[0m $1"; }
error() { echo -e "\033[1;31m[dev-up]\033[0m $1"; }

# ---------- 1. Prérequis système ----------
info "Vérification des prérequis..."

command -v node >/dev/null 2>&1 || { error "node introuvable — installe Node.js (https://nodejs.org)"; exit 1; }
command -v python3 >/dev/null 2>&1 || { error "python3 introuvable — installe Python 3"; exit 1; }
command -v tofu >/dev/null 2>&1 || warn "tofu (OpenTofu) introuvable dans le PATH — le worker-opentofu ne pourra pas exécuter plan/apply. Installe-le : https://opentofu.org/docs/intro/install/"

if [ ! -f "$ROOT_DIR/apps/api/.env" ]; then
    error "apps/api/.env manquant — ce fichier contient JWT_SECRET, CREDENTIALS_ENCRYPTION_KEY, DATABASE_URL etc. Crée-le avant de relancer (demande à quelqu'un qui l'a déjà, ne se génère pas automatiquement)."
    exit 1
fi

# ---------- 2. Setup des workers Python ----------
setup_python_worker() {
    local name="$1"
    local dir="$ROOT_DIR/apps/$name"
    if [ ! -d "$dir/venv" ]; then
        info "$name : création du venv..."
        python3 -m venv "$dir/venv"
    fi
    info "$name : installation des dépendances Python..."
    "$dir/venv/bin/pip" install -q --disable-pip-version-check -r "$dir/requirements.txt"
}

setup_python_worker worker-openstack
setup_python_worker worker-opentofu
setup_python_worker worker-ansible

if [ ! -x "$ROOT_DIR/apps/worker-ansible/venv/bin/ansible-playbook" ]; then
    warn "ansible-playbook introuvable dans le venv worker-ansible après install — vérifie apps/worker-ansible/requirements.txt"
fi

# ---------- 3. Setup api (Node) ----------
if [ ! -d "$ROOT_DIR/apps/api/node_modules" ]; then
    info "api : npm install..."
    (cd "$ROOT_DIR/apps/api" && npm install)
fi

info "api : synchronisation du schéma de base de données (prisma migrate deploy)..."
(cd "$ROOT_DIR/apps/api" && npx prisma migrate deploy)

# ---------- 4. Setup frontend-v2 (Node) ----------
if [ ! -d "$ROOT_DIR/apps/frontend-v2/node_modules" ]; then
    info "frontend-v2 : npm install..."
    (cd "$ROOT_DIR/apps/frontend-v2" && npm install)
fi

# ---------- 5. Lancement des services ----------
PIDS=()

start_service() {
    local name="$1"
    shift
    info "Démarrage de $name..."
    ("$@" > "$LOG_DIR/$name.log" 2>&1) &
    PIDS+=($!)
}

cleanup() {
    info "Arrêt des services..."
    for pid in "${PIDS[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
    wait 2>/dev/null || true
    info "Stoppé."
}
trap cleanup EXIT INT TERM

start_service worker-openstack bash -c "cd '$ROOT_DIR/apps/worker-openstack' && venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000"
start_service worker-opentofu  bash -c "cd '$ROOT_DIR/apps/worker-opentofu' && venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8010"
start_service worker-ansible   bash -c "cd '$ROOT_DIR/apps/worker-ansible' && venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8020"
start_service api              bash -c "cd '$ROOT_DIR/apps/api' && npm run dev"
start_service frontend-v2      bash -c "cd '$ROOT_DIR/apps/frontend-v2' && npm run dev -- --host"

sleep 2

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "<ton-ip>")"

echo ""
info "Tout est lancé. Logs dans $LOG_DIR/*.log"
info "En local      : http://localhost:5173"
info "Sur le réseau : http://$LAN_IP:5173"
info "Ctrl+C pour tout arrêter."
echo ""

wait
