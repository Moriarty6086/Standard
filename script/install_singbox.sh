#!/usr/bin/env bash
# Install sing-box from the official APT repository (Debian/Ubuntu).
# Usage: sudo bash install_singbox.sh [--beta]
set -euo pipefail

case "${1:-}" in
    "") PACKAGE=sing-box ;;
    --beta) PACKAGE=sing-box-beta ;;
    *) echo "用法: sudo bash $0 [--beta]" >&2; exit 2 ;;
esac

if (( $# > 1 )); then
    echo "用法: sudo bash $0 [--beta]" >&2
    exit 2
fi

if (( EUID != 0 )); then
    echo "请使用 sudo 或 root 用户运行此脚本。" >&2
    exit 1
fi

if ! command -v apt-get >/dev/null 2>&1; then
    echo "仅支持使用 APT 的 Debian/Ubuntu 系统。" >&2
    exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
    echo "缺少 curl，请先安装 curl。" >&2
    exit 1
fi

if command -v sing-box >/dev/null 2>&1; then
    echo "sing-box 已安装，跳过安装。"
    sing-box version | sed -n '1p'
    exit 0
fi

# Official SagerNet APT repository and signing key.
mkdir -p /etc/apt/keyrings
curl -fsSL https://sing-box.app/gpg.key -o /etc/apt/keyrings/sagernet.asc
chmod 0644 /etc/apt/keyrings/sagernet.asc

cat > /etc/apt/sources.list.d/sagernet.sources <<'SOURCES'
Types: deb
URIs: https://deb.sagernet.org/
Suites: *
Components: *
Enabled: yes
Signed-By: /etc/apt/keyrings/sagernet.asc
SOURCES

echo "正在更新 APT 软件包索引..."
apt-get update

echo "正在安装 ${PACKAGE}..."
apt-get install -y "${PACKAGE}"

echo "安装完成："
sing-box version | sed -n '1p'
