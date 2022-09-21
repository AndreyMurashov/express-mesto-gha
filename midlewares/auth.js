const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const { authorisation } = req.body;

  if (!authorisation || !authorisation.startsWith('Bearer')) {
    return res.status(401).send({ message: 'Необходима авторизация' });
  }
  const token = authorisation.replace('Bearer', '');

  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    return res.status(401).send({ message: 'Небходима авторизация' });
  }

  req.user = payload;
  next();
};
