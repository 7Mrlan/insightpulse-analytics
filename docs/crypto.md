### **前端加密模块指导性文档**

**目标**：本文档旨在为前端开发者提供加密模块的详细指导，包括如何使用、理解核心逻辑、优化方案及安全性增强建议。该模块处理加密、解密和签名生成等任务，使用现代的加密标准（如 AES-GCM 和 HMAC）。

---

### **1. 概述**

本模块实现了基于 **AES-GCM** 和 **HMAC-SHA-256** 的数据加密、解密与签名生成。模块中的主要功能包括：

- **加密**：使用 AES-GCM 模式加密数据，并返回 Base64 编码的密文。
- **解密**：解密基于 AES-GCM 加密的数据，返回明文。
- **签名生成**：基于 HMAC-SHA-256 算法生成消息签名，用于验证数据完整性。

---

### **2. 主要模块和功能**

#### **2.1 加密 (`encryptDataWithAES`)**

**功能**：将输入数据加密，并返回 Base64 编码的密文。

- **加密算法**：使用 AES-GCM 加密。
- **输入数据**：明文字符串。
- **输出数据**：Base64 编码的密文。

**示例代码**：
```typescript
const encryptedData = await encryptDataWithAES("Sensitive Data");
console.log("Encrypted Data: ", encryptedData);
```

**流程**：
1. 生成随机初始化向量（IV）。
2. 获取加密密钥。
3. 使用 `crypto.subtle.encrypt` 方法对数据进行加密。
4. 合并 IV 和密文，并进行 Base64 编码。
5. 返回加密后的数据。

---

#### **2.2 解密 (`decryptDataWithAES`)**

**功能**：解密由 AES-GCM 加密的密文，返回明文。

- **解密算法**：使用 AES-GCM 解密。
- **输入数据**：Base64 编码的密文。
- **输出数据**：解密后的明文字符串。

**示例代码**：
```typescript
const decryptedData = await decryptDataWithAES(encryptedData);
console.log("Decrypted Data: ", decryptedData);
```

**流程**：
1. 对 Base64 编码的密文进行解码。
2. 提取 IV 和密文部分。
3. 获取加密密钥。
4. 使用 `crypto.subtle.decrypt` 方法解密密文。
5. 返回解密后的数据。

---

#### **2.3 签名生成 (`generateSecureSignature`)**

**功能**：基于 HMAC-SHA-256 算法生成消息签名。

- **签名算法**：使用 HMAC-SHA-256。
- **输入数据**：包含 HTTP 方法、URL、数据、时间戳和随机数（nonce）。
- **输出数据**：十六进制格式的签名。

**示例代码**：
```typescript
const signature = await generateSecureSignature({
  method: 'POST',
  url: '/api/endpoint',
  data: { key: 'value' },
  timestamp: Date.now(),
  nonce: 'unique-nonce',
});
console.log("Generated Signature: ", signature);
```

**流程**：
1. 构建签名的负载，包括 HTTP 方法、URL、请求数据、时间戳和随机数。
2. 使用 `crypto.subtle.sign` 方法生成 HMAC 签名。
3. 将签名转换为十六进制字符串并返回。

---

### **3. 错误处理**

所有加密、解密和签名生成操作都采用了全局的错误处理机制。任何加密过程中的错误都会抛出 `CryptoError` 异常，并通过 `handleError` 进行捕获和处理。

**示例代码**：
```typescript
try {
  const encryptedData = await encryptDataWithAES("Sensitive Data");
} catch (error) {
  if (error instanceof CryptoError) {
    console.error("Encryption failed:", error.message);
  }
}
```

---

### **4. 密钥管理**

密钥由 `KeyManager` 管理，支持按需从后端拉取密钥。加密密钥和签名密钥分别通过 `getKey('encryption')` 和 `getKey('signature')` 方法获取，并使用缓存机制避免重复请求。

- **密钥生命周期管理**：密钥缓存会在 1 小时后过期，超过时间后会重新从后端获取。
- **密钥派生**：通过 `deriveKey` 方法，使用从后端获取的主密钥和盐，派生出 AES 和 HMAC 密钥。

**示例代码**：
```typescript
const encryptionKey = await KeyManager.getKey('encryption');
const signatureKey = await KeyManager.getKey('signature');
```

---

### **5. 加密过程中的数据清除**

为了增强数据安全性，加密和解密过程中，敏感数据会在使用完毕后被清除。

- **内存清理**：使用 `KeyManager.clearSensitiveData` 方法，确保内存中的敏感数据被及时清除，防止信息泄露。

**示例代码**：
```typescript
KeyManager.clearSensitiveData(new Uint8Array(encryptedData)); // 清除加密后的数据
KeyManager.clearSensitiveData(new Uint8Array(decryptedData)); // 清除解密后的数据
```

---

### **6. 安全性和性能优化**

- **算法选择**：使用 AES-GCM 和 HMAC-SHA-256，确保数据的机密性、完整性和不可篡改性。
- **重试机制**：对于获取密钥的操作，使用指数退避算法来避免过多的重复请求。
- **密钥管理**：密钥通过派生生成，并且只通过安全的 HMAC 和 AES 算法进行加密和解密操作。
- **数据清理**：加密后和解密后的数据都通过 `KeyManager.clearSensitiveData` 清理，防止数据泄漏。

### **7. API 设计与规范**

所有 API 请求和响应均使用 `async/await` 异步编程模型，保证高效且易于维护。每个函数都处理并返回承诺（Promise），并且所有的错误都通过统一的 `handleError` 函数进行捕获。

**API 响应结构**：
- `status`: 请求状态
- `message`: 错误或成功消息
- `data`: 返回的实际数据

---

### **8. 进一步优化与改进建议**

1. **密钥的过期管理**：
   - 目前的密钥缓存机制在密钥过期时会重新请求，可以进一步优化为 **延迟加载** 或 **定期刷新**，以减少对服务器的频繁请求。
   
2. **增强的日志系统**：
   - 在生产环境中，错误日志记录较为简单，可能需要加入更多的上下文信息（如请求的具体数据、用户信息等），便于调试和监控。

3. **对大数据的支持**：
   - 目前，前端加密主要针对小数据量。未来如果需要支持大数据加密，可以考虑将数据分块处理，减少内存压力。

---

### **9. 总结**

此模块已实现了基于现代加密算法的加密、解密和签名功能，并且在错误处理、密钥管理、性能优化和安全性等方面进行了优化。它为前端开发者提供了一个高效、安全、可靠的加密解决方案，符合当前前端加密标准。

前端开发者应注意以下几点：
- 密钥管理和生命周期管理：确保密钥的安全性。
- 加密数据清理：防止敏感数据在内存中残留。
- 错误处理：使用统一的错误处理机制，确保问题能迅速定位。