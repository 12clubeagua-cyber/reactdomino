# PADRAO: RUST SAFETY-FIRST (Hardcore Security)
# Origem: akitaonrails/FrankClaw/crates/frankclaw-crypto/src/lib.rs

Este snippet reflete a mentalidade de seguranca em nivel de hardware e memoria:
1. **Zeroize on Drop:** Garante que segredos nao fiquem na RAM apos o uso.
2. **Forbid Unsafe:** Recusa qualquer codigo que nao possa ser verificado pelo compilador.
3. **Error Hygiene:** Nunca vaza metadados ou material de chaves em mensagens de erro.

```rust
// Diretiva Obrigatoria (The Akita Way)
#![forbid(unsafe_code)]

// Tipagem de Erro Higienica
#[derive(Debug, thiserror::Error)]
pub enum CryptoError {
    #[error("encryption failed")] // Curto e sem detalhes sensiveis
    EncryptionFailed,
    
    #[error("decryption failed (wrong key or corrupted data)")]
    DecryptionFailed,
}

// Conceito: Secret material wrapped in types that zeroize on drop.
// (Uso de crates como 'zeroize' e 'secrecy' e o padrao aqui)
```
