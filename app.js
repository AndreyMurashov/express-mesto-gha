const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

const app = express();
const { PORT = 3000 } = process.env;

const absentisPage = (req, res) => {
  res.status(404).send({
    message: 'Страница не найдена',
  });
};

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '631f34c1f09253f02a0e664c',
  };

  next();
});

app.use(userRouter);
app.use(cardRouter);
app.all('*', absentisPage);

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
