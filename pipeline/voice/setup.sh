#!/bin/bash
# One-time setup for draft narration: a Python venv with kokoro-onnx, and the Kokoro model files.
#   pipeline/voice/setup.sh
# Works without the python3-venv system package: the venv is made without pip, then pip is bootstrapped.
set -euo pipefail
cd "$(dirname "$0")/../.."
if [ ! -x .venv/bin/pip ]; then
  python3 -m venv --without-pip .venv
  tmp=$(mktemp -d)
  curl -sSL https://bootstrap.pypa.io/get-pip.py -o "$tmp/get-pip.py"
  .venv/bin/python -I "$tmp/get-pip.py" -q
  rm -rf "$tmp"
fi
.venv/bin/pip install -q kokoro-onnx soundfile
dir=assets/voices/kokoro
mkdir -p "$dir"
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -s "$dir/$f" ] || curl -sSL -o "$dir/$f" "$base/$f"
done
echo "voice setup done: .venv + $dir"
