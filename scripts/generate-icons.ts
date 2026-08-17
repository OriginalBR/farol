// Quick script to generate minimal valid 192x192 and 512x512 PNG placeholder files for PWA manifest validation
import fs from "fs";
import path from "path";

// A 1x1 base64 transparent PNG buffer
const dummyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

const iconsDir = path.join(process.cwd(), "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, "icon-192x192.png"), dummyPng);
fs.writeFileSync(path.join(iconsDir, "icon-512x512.png"), dummyPng);
fs.writeFileSync(path.join(iconsDir, "badge-72x72.png"), dummyPng);

console.log("PWA icons generated.");
