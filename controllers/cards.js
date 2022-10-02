const Card = require('../models/card');
const DefaultError = require('../errors/DefaultError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');
const BadRequestError = require('../errors/BadRequestError');

// возвращает все карточки
module.exports.getCards = async (req, res, next) => {
  try {
    const data = await Card.find({});
    res.status(200).json({ data });
  } catch (err) {
    next(new DefaultError('На сервере произошла ошибка'));
  }
};

// создаёт карточку
module.exports.createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const owner = req.user._id;
    const data = await Card.create({ name, link, owner });
    const { likes, _id, createdAt } = data;

    res.status(200).json({
      likes, _id, name, link, owner, createdAt,
    });
  } catch (e) {
    if (e.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при создании карточки'));
    } else {
      next(new DefaultError('Ошибка по умолчанию'));
    }
  }
};

// удаляет карточку по идентификатору
module.exports.removeCard = (req, res, next) => {
  Card.findById(req.params.cardId).orFail(() => {})
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Запрашиваемый ресурс не найден'));
      }
      if (req.user._id === card.owner.toString()) {
        return Card.deleteOne(card)
          .then(() => {
            res.status(200).send({ message: 'Карточка удалена' });
          });
      } else {
        next(new ForbiddenError('Нельзя удалять чужие карточки'));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Карточка с указанным _id не найдена'));
      } else {
        next(new DefaultError('На сервере произошла ошибка'));
      }
    });
};

// поставить лайк карточке
module.exports.likeCard = async (req, res, next) => {
  try {
    const data = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (!data) {
      next(new NotFoundError('Передан несуществующий _id карточки'));
    } else {
      const owner = req.user._id;
      const
        {
          likes, _id, name, link, createdAt,
        } = data;
      res.status(200).json({
        likes, _id, name, link, owner, createdAt,
      });
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(new BadRequestError('Переданы некорректные данные для постановки/снятии лайка'));
    } else {
      next(new DefaultError('На сервере произошла ошибка'));
    }
  }
};

// убрать лайк с карточки
module.exports.dislikeCard = async (req, res, next) => {
  try {
    const data = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (!data) {
      next(new NotFoundError('Передан несуществующий _id карточки'));
    } else {
      const owner = req.user._id;
      const {
        likes, _id, name, link, createdAt,
      } = data;
      res.status(200).json({
        likes, _id, name, link, owner, createdAt,
      });
    }
  } catch (err) {
    console.log(err.name);
    if (err.name === 'CastError') {
      next(new BadRequestError('Переданы некорректные данные для постановки/снятии лайка'));
    } else {
      next(new DefaultError('На сервере произошла ошибка'));
    }
  }
};
