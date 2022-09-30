const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (!authorization || !authorization.startsWith('Bearer')) {
    res.status(401).send({ message: 'Необходима авторизация' });
  }
  const token = authorization.replace(/Bearer\s?/, '');
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
    console.log('no pay');
  } catch (err) {
    res.status(401).send({ message: 'Небходима авторизация' });
  }

  req.user = payload;
  next();
};
