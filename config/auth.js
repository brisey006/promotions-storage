const jwt = require('jsonwebtoken');
const { getToken } = require('../functions/users');
const { systemError } = require('../functions/errors');

const isAuthenticated = async (req, res, next) => {
    try {
        const token = getToken(req);
        if (token) {
            const authData = jwt.verify(token, process.env.JWT_KEY);
            req.user = authData;
            next();
        } else {
            next(systemError('Access token needed to access this route.', 403));
        }
    } catch (e) {
        next(systemError(e.message, 401));
    }
}

module.exports = {
    isAuthenticated
}