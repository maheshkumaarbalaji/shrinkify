import crypto from 'crypto';

/**
 * Hashing Algorithm to be used to generate the hash value.
 */
const ALGORITHM = "md5";
/**
 * Total length of the hash value generated.
 */
const HASH_LENGTH = 10;

/**
 * Generates and returns the hash value for the given target URL. If the hash value is more than 10 characters long, then the first 10 characters of the hash are returned.
 * @param {string} value - input value to be hashed.
 * @returns {string} - generated hash value.
 */
function GetHashFor(value)
{
    let digestValue = crypto.createHash(ALGORITHM).update(value).digest('hex');
    digestValue = digestValue.slice(0, HASH_LENGTH);
    return digestValue;
}

export { GetHashFor };