#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
SKIP_BUILD=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --noBuild)
      SKIP_BUILD=1
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: bash script/deploy.sh [--noBuild]"
      exit 1
      ;;
  esac
done

if [[ -f "$ENV_FILE" ]]; then
  # Export variables from script/.env so they are available below.
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

VPS_HOST="${VPS_HOST:-11.4.51.4}"
VPS_USER="${VPS_USER:-meow}"
VPS_PORT="${VPS_PORT:-22}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/html}"
REMOTE_USE_SUDO="${REMOTE_USE_SUDO:-1}"
SSH_PASSWORD="${SSH_PASSWORD:-}"
SUDO_PASSWORD="${SUDO_PASSWORD:-$SSH_PASSWORD}"

if [[ -z "$VPS_HOST" ]]; then
  echo "Missing VPS_HOST."
  echo "Example:"
  echo "  Copy script/.env.example to script/.env and fill in VPS_HOST, VPS_USER, etc."
  exit 1
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "bun is required but was not found in PATH."
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required but was not found in PATH."
  exit 1
fi

if ! command -v ssh >/dev/null 2>&1; then
  echo "ssh is required but was not found in PATH."
  exit 1
fi

if [[ -n "$SSH_PASSWORD" ]] && ! command -v sshpass >/dev/null 2>&1; then
  echo "sshpass is required when SSH_PASSWORD is set, but it was not found in PATH."
  exit 1
fi

REMOTE_TARGET="${VPS_USER}@${VPS_HOST}"
SSH_OPTS=(
  -p "$VPS_PORT"
  -o ConnectTimeout=10
  -o ServerAliveInterval=15
  -o ServerAliveCountMax=3
)
RSYNC_SSH_CMD="ssh -p $VPS_PORT -o ConnectTimeout=10 -o ServerAliveInterval=15 -o ServerAliveCountMax=3"
REMOTE_TMP_DIR="${REMOTE_TMP_DIR:-/tmp/blog-deploy-${USER:-deploy}-$$}"

shell_escape() {
  printf "%s" "$1" | sed "s/'/'\\\\''/g"
}

run_ssh() {
  if [[ -n "$SSH_PASSWORD" ]]; then
    SSHPASS="$SSH_PASSWORD" sshpass -e ssh "${SSH_OPTS[@]}" "$@"
  else
    ssh "${SSH_OPTS[@]}" "$@"
  fi
}

run_ssh_tty() {
  if [[ -n "$SSH_PASSWORD" ]]; then
    SSHPASS="$SSH_PASSWORD" sshpass -e ssh -tt "${SSH_OPTS[@]}" "$@"
  else
    ssh -tt "${SSH_OPTS[@]}" "$@"
  fi
}

run_rsync() {
  if [[ -n "$SSH_PASSWORD" ]]; then
    SSHPASS="$SSH_PASSWORD" sshpass -e rsync -az --delete -e "$RSYNC_SSH_CMD" "$@"
  else
    rsync -az --delete -e "$RSYNC_SSH_CMD" "$@"
  fi
}

run_remote_sudo() {
  local remote_cmd="$1"

  if [[ -n "$SUDO_PASSWORD" ]]; then
    local escaped_password
    local escaped_cmd
    escaped_password="$(shell_escape "$SUDO_PASSWORD")"
    escaped_cmd="$(shell_escape "$remote_cmd")"
    run_ssh_tty "$REMOTE_TARGET" "printf '%s\n' '$escaped_password' | sudo -S -p '' bash -lc '$escaped_cmd'"
  else
    run_ssh_tty "$REMOTE_TARGET" "sudo bash -lc '$(shell_escape "$remote_cmd")'"
  fi
}

upload_dist() {
  local remote_path="$1"

  echo "==> Uploading dist/ with rsync"
  if run_rsync \
    "$DIST_DIR"/ \
    "$REMOTE_TARGET:$remote_path/"; then
    return 0
  fi

  echo "==> rsync upload failed, falling back to tar over ssh"
  run_ssh "$REMOTE_TARGET" "rm -rf '$(shell_escape "$remote_path")' && mkdir -p '$(shell_escape "$remote_path")'"
  if [[ -n "$SSH_PASSWORD" ]]; then
    tar -C "$DIST_DIR" -czf - . | SSHPASS="$SSH_PASSWORD" sshpass -e ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" "tar -xzf - -C '$(shell_escape "$remote_path")'"
  else
    tar -C "$DIST_DIR" -czf - . | ssh "${SSH_OPTS[@]}" "$REMOTE_TARGET" "tar -xzf - -C '$(shell_escape "$remote_path")'"
  fi
}

if [[ "$SKIP_BUILD" == "0" ]]; then
  echo "==> Installing dependencies"
  (cd "$ROOT_DIR" && bun install --frozen-lockfile)

  echo "==> Building project"
  (cd "$ROOT_DIR" && bun run build)
else
  echo "==> Skipping install and build because --noBuild was provided"
fi

if [[ ! -d "$DIST_DIR" ]]; then
  echo "dist directory was not found: $DIST_DIR"
  echo "Run a build first, or rerun deploy without --noBuild."
  exit 1
fi

if [[ -z "$(find "$DIST_DIR" -mindepth 1 -print -quit 2>/dev/null)" ]]; then
  echo "dist directory is empty: $DIST_DIR"
  echo "Run a build first, or rerun deploy without --noBuild."
  exit 1
fi

echo "==> Checking SSH connectivity"
run_ssh "$REMOTE_TARGET" "echo 'SSH connection OK'" >/dev/null

if [[ "$REMOTE_USE_SUDO" == "1" ]]; then
  echo "==> Preparing remote temp directory: $REMOTE_TMP_DIR"
  run_ssh "$REMOTE_TARGET" "mkdir -p '$(shell_escape "$REMOTE_TMP_DIR")'"

  upload_dist "$REMOTE_TMP_DIR"

  echo "==> Moving files into $REMOTE_DIR with sudo"
  run_remote_sudo "mkdir -p '$(shell_escape "$REMOTE_DIR")' && rsync -a --delete '$(shell_escape "$REMOTE_TMP_DIR")/' '$(shell_escape "$REMOTE_DIR")/' && rm -rf '$(shell_escape "$REMOTE_TMP_DIR")'"
else
  echo "==> Preparing remote directory: $REMOTE_DIR"
  run_ssh "$REMOTE_TARGET" "mkdir -p '$(shell_escape "$REMOTE_DIR")'"

  upload_dist "$REMOTE_DIR"
fi

echo "==> Deploy finished"
echo "Remote path: $REMOTE_TARGET:$REMOTE_DIR"
