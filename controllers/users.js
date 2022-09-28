const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const DefaultError = require('../errors/DefaultError');
const AuthorizationError = require('../errors/AuthorizationError');
const LoginError = require('../errors/LoginError');

// возвращает всех пользователей
const getUsers = async (req, res, next) => {
  try {
    const data = await User.find({});
    const {
      name, about, avatar, password,
    } = data;
    res.status(200).json({
      name, about, avatar, password,
    });
  } catch (err) {
    next(new DefaultError('На сервере произошла ошибка'));
  }
};

// возвращает пользователя по _id
const getOneUser = async (req, res, next) => {
  const data = await User.findById(req.params.userId)
    .then((data) => {
      if (!data) {
        next(new NotFoundError('Нет пользователя с таким ID'));
      } else {
        const {
          name, about, avatar, password,
        } = data;
        res.status(200).json({
          name, about, avatar, password,
        });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Ошибочный запрос'));
      } else {
        next(new DefaultError('На сервере произошла ошибка'));
      }
      next(err);
    });
};

// возвращает текущего пользователя
const getCurrentUser = (req, res, next) => {
  const data = User.findById(req.user._id)
    .then((data) => {
      if (!data) {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        const {
          name, about, avatar, _id, password,
        } = data;
        res.status(200).json({
          name, about, avatar, _id, password,
        });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Ошибочный запрос'));
      } else {
        throw new DefaultError('На сервере произошла ошибка');
      }
      next(err);
    });
};

// создаёт пользователя
const createUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new BadRequestError('Неправильный логин или пароль.'));
  }
  return bcrypt.hash(password, 10)
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
        next(new AuthorizationError(`Пользователь с адресом электронной почты ${email} уже существует.`));
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
    if (!name || !about) {
      next(new BadRequestError('Неверный запрос.'));
    }
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
      next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
    } else if (err.name === 'DocumentNotFoundError') {
      next(new NotFoundError('Пользователь с указанным _id не найден'));
    } else {
      next(new DefaultError('На сервере произошла ошибка'));
    }
  }
};

// обновляет аватар
const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      next(new BadRequestError('Неверный запрос.'));
    }
    await User.findByIdAndUpdate(req.user._id, {
      avatar,
    }, { new: true, runValidators: true })
      .orFail()
      .then(() => {
        res.status(200).json({ avatar });
      });
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
    } else if (err.name === 'DocumentNotFoundError') {
      next(new NotFoundError('Пользователь с указанным _id не найден'));
    } else {
      next(new DefaultError('На сервере произошла ошибка'));
    }
  }
};

// авторизация пользователя
const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new BadRequestError('Неверный запрос.'));
  }
  console.log(email, password);
  if (!validator.isEmail(email)) {
    next(new BadRequestError('Неправильный формат электронной почты.'));
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: '633451f7c181427a4da91183' }, 'some-secret-key', { expiresIn: '7d' });
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
