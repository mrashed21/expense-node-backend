import crypto from 'crypto';

/**
 * Base32 Encoding/Decoding implementation according to RFC 4648
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(str: string): Buffer {
  str = str.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc(((str.length * 5) / 8) | 0);
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) throw new Error('Invalid Base32 character: ' + char);
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return output;
}

/**
 * Generate a new TOTP secret (base32 encoded)
 */
export function generateSecret(length = 20): string {
  const buffer = crypto.randomBytes(length);
  return base32Encode(buffer);
}

/**
 * Generate an otpauth:// URI for QR Code generation
 */
export function generateAuthURI(secret: string, accountName: string, issuer = 'Expense Tracker'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Get the current TOTP token for a given secret
 */
export function generateToken(secret: string, timeStep = 30): string {
  const decodedSecret = base32Decode(secret);
  const time = Buffer.alloc(8);
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  
  time.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  time.writeUInt32BE(counter & 0xffffffff, 4);

  const hmac = crypto.createHmac('sha1', decodedSecret);
  hmac.update(time);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const code = ((digest[offset] & 0x7f) << 24) |
               ((digest[offset + 1] & 0xff) << 16) |
               ((digest[offset + 2] & 0xff) << 8) |
               (digest[offset + 3] & 0xff);

  let token = (code % 1000000).toString();
  while (token.length < 6) {
    token = '0' + token;
  }
  return token;
}

/**
 * Verify a TOTP token (allows 1 step window for clock drift)
 */
export function verifyToken(secret: string, token: string, timeStep = 30): boolean {
  if (!token || token.length !== 6) return false;
  
  // Check current window and previous/next windows to account for slight delays
  const currentCounter = Math.floor(Date.now() / 1000 / timeStep);
  
  for (let i = -1; i <= 1; i++) {
    const time = Buffer.alloc(8);
    const counter = currentCounter + i;
    
    time.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
    time.writeUInt32BE(counter & 0xffffffff, 4);

    const hmac = crypto.createHmac('sha1', base32Decode(secret));
    hmac.update(time);
    const digest = hmac.digest();

    const offset = digest[digest.length - 1] & 0xf;
    const code = ((digest[offset] & 0x7f) << 24) |
                 ((digest[offset + 1] & 0xff) << 16) |
                 ((digest[offset + 2] & 0xff) << 8) |
                 (digest[offset + 3] & 0xff);

    let generatedToken = (code % 1000000).toString();
    while (generatedToken.length < 6) {
      generatedToken = '0' + generatedToken;
    }
    
    if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(generatedToken))) {
      return true;
    }
  }
  return false;
}
