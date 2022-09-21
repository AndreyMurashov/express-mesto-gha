const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// возвращает всех пользователей
const getUsers = async (req, res) => {
  try {
    const data = await User.find({});
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send({
      message: 'Ошибка по умолчанию',
    });
  }
};

// возвращает пользователя по _id
const getOneUser = async (req, res) => {
  try {
    const data = await User.findById(req.params.userId);
    if (!data) {
      res.status(404).send({
        message: 'Пользователь не найден',
      });
      return;
    } else {
      const {
        name, about, avatar, _id,
      } = data;
      res.status(200).json({
        name, about, avatar, _id,
      });
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(400).send({
        message: 'Ошибочный запрос',
      });
      return;
    } else {
      res.status(500).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

// возвращает текущего пользователя
const getCurrentUser = async (req, res) => {
  try {
    const data = await User.findById(req.params.user);
    if (!data) {
      res.status(404).send({
        message: 'Пользователь не найден',
      });
      return;
    } else {
      const {
        name, about, avatar, _id,
      } = data;
      res.status(200).json({
        name, about, avatar, _id,
      });
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(400).send({
        message: 'Ошибочный запрос',
      });
      return;
    } else {
      res.status(500).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

// создаёт пользователя
const createUser = (req, res) => {
  try {
    bcrypt.hash(req.body.password, 10)
      .then((hash) => {
        const {
          name, about, avatar, email,
        } = req.body;
        const data = User.create(
          {
            name, about, avatar, email, password: hash,
          },
        );
        // })
        // .then((data) => {
        const { _id } = data;
        res.status(200).json({
          name, about, avatar, email, _id,
        });
      });
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).send({
        message: 'Переданы некорректные данные при создании пользователя',
      });
      return;
    }
    res.status(500).send({ message: 'Ошибка по умолчанию' });
  }
};

// обновляет профиль
const updateUser = async (req, res) => {
  try {
    const { name, about } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      name,
      about,
    }, { new: true, runValidators: true }).orFail()
      .then(() => {
        res.status(200).send({ name, about });
      });
  } catch (err) {
    console.log(err);
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      res.status(400).send({
        message: 'Переданы некорректные данные при обновлении профиля',
      });
      return;
    } else if (err.name === 'DocumentNotFoundError') {
      res.status(404).send({
        message: 'Пользователь с указанным _id не найден',
      });
      return;
    } else {
      res.status(400).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

// обновляет аватар
const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      avatar,
    }).orFail()
      .then(() => {
        res.status(200).json({ avatar });
      });
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      res.status(400).send({
        message: 'Переданы некорректные данные при обновлении профиля',
      });
      return;
    } else if (err.name === 'DocumentNotFoundError') {
      res.status(404).send({
        message: 'Пользователь с указанным _id не найден',
      });
      return;
    } else {
      res.status(500).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

// авторизация пользователя
const login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};

module.exports = {
  getUsers,
  getOneUser,
  createUser,
  updateUser,
  updateAvatar,
  login,
  getCurrentUser,
};
