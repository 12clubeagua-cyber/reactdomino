# Multi-stage Build (Rigor Técnico)

# 1. Build Rust/Wasm
FROM rust:1.95-slim as wasm-builder
RUN apt-get update && apt-get install -y curl
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
WORKDIR /app
COPY domino-core-wasm .
RUN wasm-pack build --target web

# 2. Build Go Server
FROM golang:1.26-alpine as go-builder
WORKDIR /app
COPY domino-server-go .
RUN go build -o domino-server main.go

# 3. Final Production Image
FROM alpine:latest
WORKDIR /root/
RUN apk add --no-cache libc6-compat

# Copia binário do servidor
COPY --from=go-builder /app/domino-server .

# Copia arquivos estáticos (Frontend)
COPY wasm ./wasm
COPY *.html .
COPY *.js .
COPY *.css .
COPY *.json .
COPY *.png .

# Binário Wasm do builder
COPY --from=wasm-builder /app/pkg ./wasm

EXPOSE 8080
CMD ["./domino-server"]
