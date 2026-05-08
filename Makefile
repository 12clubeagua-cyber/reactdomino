# --- REACTDOMINO MASTER BUILD PIPELINE ---

# Variáveis
WASM_DIR = domino-core-wasm
SERVER_DIR = domino-server-go
OUTPUT_WASM = wasm

.PHONY: all build-wasm build-server clean help

all: build-wasm build-server

# Fase 1: Build Rust/Wasm
build-wasm:
	@echo "Compilando motor Rust para WebAssembly..."
	cd $(WASM_DIR) && wasm-pack build --target web
	mkdir -p $(OUTPUT_WASM)
	cp -r $(WASM_DIR)/pkg/* $(OUTPUT_WASM)/

# Fase 2: Build Go Server
build-server:
	@echo "Compilando servidor Go..."
	cd $(SERVER_DIR) && go build -o ../domino-server main.go

# Limpeza
clean:
	@echo "Limpando artefatos de build..."
	rm -rf $(OUTPUT_WASM)
	rm -f domino-server
	cd $(WASM_DIR) && rm -rf target pkg
	cd $(SERVER_DIR) && rm -f domino-server domino.db

# Ajuda
help:
	@echo "Comandos disponíveis:"
	@echo "  make all          - Compila tudo (Wasm + Go)"
	@echo "  make build-wasm   - Compila apenas o motor Rust"
	@echo "  make build-server - Compila apenas o servidor Go"
	@echo "  make clean        - Remove binários e caches"
