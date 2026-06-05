#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# NQTCoder Backend — Render.com Build Script
# Runs automatically on every deploy. Installs all required compilers on the
# Linux server so the code editor works without any manual setup.
# ─────────────:──────────────────────────────────────────────────────────────

set -e  # Stop on any error

echo "=========================================="
echo " NQTCoder — Installing System Compilers"
echo "=========================================="

# ── 1. Update package list ────────────────────────────────────────────────
echo "[1/4] Updating apt package index..."
apt-get update -qq

# ── 2. Install C++ compiler (g++) ─────────────────────────────────────────
echo "[2/4] Installing g++ (C++ compiler)..."
apt-get install -y -qq g++
echo "✓ g++ installed: $(g++ --version | head -n1)"

# ── 3. Install Python 3 ───────────────────────────────────────────────────
echo "[3/4] Installing Python 3..."
apt-get install -y -qq python3
# Create 'python' alias so our code can call either 'python' or 'python3'
if ! command -v python &> /dev/null; then
  ln -sf /usr/bin/python3 /usr/local/bin/python
fi
echo "✓ Python installed: $(python3 --version)"

# ── 4. Install Java (OpenJDK 17 — free, LTS, compatible) ──────────────────
echo "[4/4] Installing Java (OpenJDK 17)..."
apt-get install -y -qq default-jdk
echo "✓ Java installed: $(java -version 2>&1 | head -n1)"
echo "✓ javac installed: $(javac -version 2>&1)"

# ── 5. Install Node dependencies ──────────────────────────────────────────
echo ""
echo "Installing Node.js dependencies..."
npm install

echo ""
echo "=========================================="
echo " ✅ All compilers installed successfully!"
echo "=========================================="
