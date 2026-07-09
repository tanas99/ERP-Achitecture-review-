import bcrypt from "bcryptjs";

/**
 * PasswordHasher — abstraction over the hashing algorithm so the implementation
 * is swappable (ARCHITECTURE.md §5). ARCHITECTURE.md specifies Argon2id for
 * production; we ship a bcrypt implementation now (pure-JS, zero native build)
 * behind this interface and can switch to argon2 without touching call sites.
 */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

const BCRYPT_ROUNDS = 12;

export const passwordHasher: PasswordHasher = {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  },
  async verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  },
};
