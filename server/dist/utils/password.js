import bcrypt from 'bcrypt';
/**
 * Hashes the password using bcrypt algorithm
 * @param password - The password to hash
 * @returns Password hash
 */
const generatePasswordHash = async (password) => {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return hash;
};
/**
 * Validates the password against the hash
 * @param password - The password to verify
 * @param hash - Password hash to verify against
 * @returns True if the password matches the hash, false otherwise
 */
const validatePassword = async (password, hash) => {
    const result = await bcrypt.compare(password, hash);
    return result;
};
/**
 * Checks that the hash has a valid format
 * @param hash - Hash to check format for
 * @returns True if passed string seems like valid hash, false otherwise
 */
const isPasswordHash = (hash) => {
    if (!hash || hash.length !== 60)
        return false;
    try {
        bcrypt.getRounds(hash);
        return true;
    }
    catch {
        return false;
    }
};
export { generatePasswordHash, validatePassword, isPasswordHash, };
//# sourceMappingURL=password.js.map