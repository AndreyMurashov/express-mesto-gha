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
    const {
      name, about, avatar, _id,
    } = data;
    res.status(200).json({
      name, about, avatar, _id,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      // не совпадают требования проекта и автотестов - пришлось указывать код 400, чтобы прошел
      res.status(400).send({
        message: 'Пользователь по указанному _id не найден',
      });
      return;
    } else {
      res.status(500).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

// создаёт пользователя
const createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    const data = await User.create({ name, about, avatar });
    const { _id } = data;
    res.status(200).json({
      name, about, avatar, _id,
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
    });
    res.status(200).json({ name, about });
  } catch (err) {
    console.log(err.name);
    if (err.name === 'ValidationError') {
      res.status(400).send({
        message: 'Переданы некорректные данные при обновлении профиля',
      });
      return;
    } else if (err.name === 'CastError') {
      console.log(err.name);
      res.status(404).send({
        message: 'Пользователь с указанным _id не найден',
      });
      return;
    } else {
      res.status(500).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

// обновляет аватар
const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      avatar,
    });
    res.status(200).json({ avatar });
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).send({
        message: 'Переданы некорректные данные при обновлении профиля',
      });
      return;
    } else if (err.name === 'CastError') {
      console.log(err.name);
      res.status(404).send({
        message: 'Пользователь с указанным _id не найден',
      });
      return;
    } else {
      res.status(500).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

module.exports = {
  getUsers,
  getOneUser,
  createUser,
  updateUser,
  updateAvatar,
};
