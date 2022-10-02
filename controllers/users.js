const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const DefaultError = require('../errors/DefaultError');
const AuthorizationError = require('../errors/AuthorizationError');
const LoginError = require('../errors/LoginError');
const user = require('../models/user');

// возвращает всех пользователей
const getUsers = (req, res, next) => {
  User.find({})
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      next(new DefaultError('На сервере произошла ошибка'));
    });
};

// возвращает пользователя по _id
const getOneUser = async (req, res, next) => {
  const data = await User.findById(req.params.userId)
    .then((data) => {
      if (!data) {
        next(new NotFoundError('Нет пользователя с таким ID'));
      } else {
        res.status(200).json(data);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Ошибочный запрос'));
      } else {
        next(new DefaultError('На сервере произошла ошибка'));
      }
    });
};

// возвращает текущего пользователя
const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById({ _id })
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        res.status(200).json(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Ошибочный запрос'));
      } else {
        next(new DefaultError('На сервере произошла ошибка'));
      }
    });
};

// создаёт пользователя
const createUser = (req, res, next) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
    }))
    .then((user) => res.status(200).send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
      email: user.email,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        return next(new AuthorizationError(`Пользователь с адресом электронной почты ${email} уже существует.`));
      }
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      }
      return next(err);
    });
};

// обновляет профиль
const updateUser = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      name,
      about,
    }, { new: true, runValidators: true }).orFail(() => new NotFoundError('Пользователь с указанным id не существует'))
      .then(() => {
        res.status(200).send({ name, about });
      });
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
    } else {
      next(new DefaultError('На сервере произошла ошибка'));
    }
  }
};

// обновляет аватар
const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      avatar,
    }, { new: true, runValidators: true })
      .orFail(() => new NotFoundError('Пользователь с указанным id не существует'))
      .then(() => {
        res.status(200).json({ avatar });
      });
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
    } else {
      next(new DefaultError('На сервере произошла ошибка'));
    }
  }
};

// авторизация пользователя
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      next(new LoginError('Необходима авторизация'));
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
