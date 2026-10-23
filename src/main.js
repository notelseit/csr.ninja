import "./style.css";
import { createCSR } from "./pki.js";

const form = document.querySelector("#csr-form");
const status = document.querySelector("#status");
const results = document.querySelector("#results");
const submit = document.querySelector("#generate");
const preview = document.querySelector("#csr-output");
let output = null;

function download(filename, contents) {
  const url = URL.createObjectURL(new Blob([contents], { type: "application/octet-stream" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  output = null;
  preview.value = "";
  results.hidden = true;
  submit.disabled = true;
  status.textContent = "Generating your key and CSR locally…";
  try {
    const fields = Object.fromEntries(new FormData(form));
    output = await createCSR(fields);
    preview.value = output.csr;
    results.hidden = false;
    status.textContent = "Successfully generated in your browser. Download both files.";
  } catch (error) {
    status.textContent = `Unable to generate CSR: ${error.message}`;
  } finally {
    submit.disabled = false;
  }
});

document.querySelector("#download-csr").addEventListener("click", () => {
  if (output) download("request.csr", output.csr);
});
document.querySelector("#download-key").addEventListener("click", () => {
  if (output) download("private.key", output.key);
});
window.addEventListener("pagehide", () => { output = null; });
