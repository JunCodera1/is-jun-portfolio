// Usage: npm run owner:hash   — reads a password from stdin (never from argv, so it stays out of shell history) and prints the scrypt hash
// to put in OWNER_PASSWORD_HASH. Also prints a fresh SESSION_SECRET.
import { randomBytes, scrypt } from "node:crypto";
import readline from "node:readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stderr, terminal: false });
process.stderr.write("Password (min 12 characters): ");
rl.once("line", (pw) => {
  rl.close();
  if (pw.length < 12) { console.error("Too short."); process.exit(1); }
  const salt = randomBytes(16);
  scrypt(pw, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (e, key) => {
    if (e) throw e;
    console.log(`OWNER_PASSWORD_HASH=scrypt$16384$8$1$${salt.toString("base64url")}$${key.toString("base64url")}`);
    console.log(`SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
  });
});
