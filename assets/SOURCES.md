# Asset sources

One row per file under `assets/` (and per font under `styles/*/fonts/`).

| file | source | licence | notes |
|---|---|---|---|
| `styles/coasys/fonts/BricolageGrotesque-latin.woff2` | Coasys app (via Data's film kit) | SIL OFL 1.1 | licence next to the file |
| `styles/coasys/fonts/DMSans-var.ttf` | Coasys app (via Data's film kit) | SIL OFL 1.1 | licence next to the file |
| `assets/voices/kokoro/kokoro-v1.0.onnx`, `voices-v1.0.bin` | Kokoro-82M (hexgrad), ONNX export from github.com/thewh1teagle/kokoro-onnx release `model-files-v1.0` | Apache 2.0 (model and voices); MIT (kokoro-onnx) | not in git; `pipeline/voice/setup.sh` downloads them. Built-in voices, no cloned person: draft narration only, replaced by James's recording |
