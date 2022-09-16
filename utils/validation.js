// hashing
const argon2 = require("argon2");
const crypto = require("crypto");

const hashConfig = { // based on OWASP cheat sheet recommendations (as of March, 2022)
    parallelism: 1,
    memoryCost: 64000, // 64 mb
    timeCost: 3 // number of iterations
};

async function hashPassword(password) {
    let salt = crypto.randomBytes(16);
    return await argon2.hash(password, {
        salt: salt
    });
}

async function verifyPasswordWithHash(password, hash) {
    return await argon2.verify(hash, password, hashConfig);
}

module.exports = {
    verifyPasswordWithHash,
    hashPassword
};