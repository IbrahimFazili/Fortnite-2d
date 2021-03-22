const jwt = require('jsonwebtoken');

const tokenExpiryTime = 86400;
/**
 * Authenticate incoming request. If the incoming request contains a valid authorization token, call the
 * next middleware. Otherwise respond with a 401 (Forbidden)
 * @param req Express Request object
 * @param res Express Response object
 * @param next next middleware
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send("No authorization token found in the request header");

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, user) => {
        if (err) {
            res.status(401).send(`${err.name}: ${err.message}`);
        } else {
            req.username = jwt.decode(token, { json: true }).username;
            next(); // user is authorized, let them access the requested resource
        }
    });
}

/**
 * Generate access token for an authenticated user. The generated access token will be valid for 86400 seconds, i.e., 24 hrs.
 * Once the access token expires, user will need to request a new access token
 * @param uid Unique identifier for a user. This is used in the hashing process when generating the jwt
 */
function generateAccessToken(uid) {
    return jwt.sign(uid, process.env.JWT_TOKEN_SECRET, { expiresIn: tokenExpiryTime });
}

module.exports = {
    generateAccessToken,
    authenticateToken,
    tokenExpiryTime
};