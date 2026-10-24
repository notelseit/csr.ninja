import "reflect-metadata";
import * as x509 from "@peculiar/x509";

export function dnsNames(commonName, rawSans) {
  const values = [commonName, ...rawSans.split(/[\n,;]+/) ].map(s => s.trim().toLowerCase()).filter(Boolean);
  const names = [...new Set(values)];
  const valid = /^(?=.{1,253}$)(?:\*\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
  if (!names.length || names.some(n => !valid.test(n))) throw new Error("Enter valid fully-qualified DNS names (wildcards only as *.example.com).");
  return names;
}

export function subjectName(fields) {
  const parts = [["CN", fields.cn], ["O", fields.organization], ["OU", fields.unit], ["L", fields.locality], ["ST", fields.state], ["C", fields.country?.toUpperCase()]]
    .filter(([, value]) => value && value.trim());
  if (fields.country && !/^[A-Za-z]{2}$/.test(fields.country)) throw new Error("Country must contain two letters.");
  if (parts.some(([, value]) => /[,=+<>#;"\\]/.test(value))) throw new Error("Remove special DN separator characters from subject fields.");
  return parts.map(([key, value]) => `${key}=${value.trim()}`).join(", ");
}

function pem(label, bytes) {
  let binary = "";
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  return `-----BEGIN ${label}-----\n${(btoa(binary).match(/.{1,64}/g) || []).join("\n")}\n-----END ${label}-----\n`;
}

export async function createCSR(fields) {
  if (!globalThis.isSecureContext || !globalThis.crypto?.subtle) {
    throw new Error("A secure context (HTTPS or localhost) with Web Crypto is required.");
  }
  const sans = dnsNames(fields.cn, fields.sans || "");
  const name = subjectName(fields);
  const ec = fields.algorithm === "ec256";
  const bits = fields.algorithm === "rsa4096" ? 4096 : 3072;
  const algorithm = ec
    ? { name: "ECDSA", namedCurve: "P-256", hash: "SHA-256" }
    : { name: "RSASSA-PKCS1-v1_5", modulusLength: bits, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" };
  const keys = await crypto.subtle.generateKey(algorithm, true, ["sign", "verify"]);
  const csr = await x509.Pkcs10CertificateRequestGenerator.create({
    name, keys, signingAlgorithm: algorithm,
    extensions: [new x509.SubjectAlternativeNameExtension(sans.map(n => ({ type: "dns", value: n })))]
  });
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", keys.privateKey);
  return { csr: csr.toString("pem"), key: pem("PRIVATE KEY", pkcs8), commonName: fields.cn.toLowerCase() };
}
