import { test } from "node:test";
import { strict as assert } from "node:assert";
import { webcrypto } from "node:crypto";
import * as x509 from "@peculiar/x509";
import { createCSR } from "../src/pki.js";

test("generates signed ECDSA CSR and private key with DNS SAN", async () => {
  Object.defineProperty(globalThis, "isSecureContext", { value: true, configurable: true });
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
  const result = await createCSR({
    cn: "example.com",
    sans: "www.example.com",
    organization: "Example Ltd",
    unit: "IT",
    locality: "Test",
    state: "SA",
    country: "IT",
    algorithm: "ec256",
  });
  assert.match(result.csr, /BEGIN CERTIFICATE REQUEST/);
  assert.match(result.key, /BEGIN PRIVATE KEY/);
  const request = new x509.Pkcs10CertificateRequest(result.csr);
  assert.match(request.subject, /example.com/);
  assert.equal(await request.verify(), true);
});
