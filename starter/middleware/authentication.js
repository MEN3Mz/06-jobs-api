const { UnauthenticatedError } = require('../errors');
const jwt = require('jsonwebtoken');
const user = require('../models/User');
const authenticateUser = async(req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader.split(' ')[0] !== 'Bearer') {
        throw new UnauthenticatedError('No token provided');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userid: decoded.userId, username: decoded.name };


        next();
    } catch (error) {
        throw new UnauthenticatedError('Not authorized to access this route');
    }



}
module.exports = authenticateUser;