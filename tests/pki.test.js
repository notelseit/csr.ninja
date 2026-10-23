import { test } from "node:test";
import { strict as assert } from "node:assert";
import { dnsNames, subjectName } from "../src/pki.js";

test("san names are normalized and de-duplicated", () => {
  assert.deepEqual(dnsNames("Example.COM", "www.example.com\nexample.com"), ["example.com", "www.example.com"]);
});

test("reject malformed domain and malicious separators", () => {
  assert.throws(() => dnsNames("example.com", "not a hostname"));
  assert.throws(() => subjectName({cn:"example.com", organization:"Acme, CN=other"}));
});

test("subject mapping preserves fields", () => {
  assert.equal(subjectName({cn:"example.com",organization:"Acme",country:"it"}), "CN=example.com, O=Acme, C=IT");
});
