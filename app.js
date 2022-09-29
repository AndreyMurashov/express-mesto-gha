const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');

const userRouter = require('./routes/users');
const { login, createUser } = require('./controllers/users');
const cardRouter = require('./routes/cards');
const DefaultError = require('./errors/DefaultError');
const NotFoundError = require('./errors/NotFoundError');

// const auth = require('./midlewares/auth');

const app = express();
const { PORT = 3000 } = process.env;

const absentisPage = (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
};

app.use(express.json());

// app.use((req, res, next) => {
//   req.user = {
//     _id: '6335450c00a3fd38854c3fc8',
//   };
//   next();
// });

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);
// app.use(auth);
app.use(userRouter);
app.use(cardRouter);
app.all('*', absentisPage);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode, message } = err;
  if (!statusCode) {
    throw new DefaultError('На сервере произошла ошибка');
  }
  res.status(statusCode).send({ message });
});

mongoose
  .connect('mongodb://localhost:27017/mestodb', {
    useNewUrlParser: true,
  })
  .then(console.log('DB OK'))
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, (err) => {
  if (err) {
    console.log('Произошла ошибка при запуске сервера');
  }
  console.log(`Сервер запущен на ${PORT} порту`);
});
