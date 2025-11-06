import crypto from "crypto";

const key = crypto.randomBytes(64).toString("base64url");
console.log("AUTH_SECRET=" + key);
