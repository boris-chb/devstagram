const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  // Get JWT from header
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No Token. Access Denied.' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Invalid Token' });
  }
};
