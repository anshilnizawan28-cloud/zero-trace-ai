Signature Test Cases

1. Unsigned PDF
Expected:
- No signatures detected

2. Valid signed PDF
Expected:
- Signature field detected
- Certificate detected
- ByteRange extracted
- PKCS#7 extracted

3. Modified after signing
Expected:
- Signature detected
- Verification fails

4. Expired certificate
Expected:
- Signature valid
- Certificate expired

5. Revoked certificate
Expected:
- Signature valid
- Revocation check fails
