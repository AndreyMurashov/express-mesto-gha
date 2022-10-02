const jwt = require('jsonwebtoken');
const LoginError = require('../errors/LoginError');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer')) {
    next(new LoginError('Необходима авторизация'));
  }
  const token = authorization.replace(/Bearer\s?/, '');
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    next(new LoginError('Необходима авторизация'));
  }

  req.user = payload;
  next();
};
