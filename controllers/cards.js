const Card = require('../models/card');

// возвращает все карточки
module.exports.getCards = async (req, res) => {
  try {
    const data = await Card.find({});
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send({ message: 'Ошибка по умолчанию' });
  }
};

// создаёт карточку
module.exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const owner = req.user._id;
    const data = await Card.create({ name, link, owner });
    const { likes, _id, createdAt } = data;

    res.status(200).json({
      likes, _id, name, link, owner, createdAt,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).send({
        message: 'Переданы некорректные данные при создании карточки',
      });
      return;
    } else {
      res.status(500).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

// удаляет карточку по идентификатору
module.exports.removeCard = async (req, res) => {
  try {
    await Card.findById(req.params.cardId).orFail(() => {})
      .then((card) => Card.deleteOne(card)
        .then(() => {
          res.status(200).send({ message: 'Карточка удалена' });
        }));
  } catch (err) {
    console.log(err.name);
    if (err.name === 'CastError') {
      res.status(400).send({
        message: 'Переданы некорректные данные',
      });
      return;
    } else if (err.name === 'DocumentNotFoundError') {
      res.status(404).send({
        message: 'Карточка с указанным _id не найдена',
      });
      return;
    } else {
      res.status(500).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

// поставить лайк карточке
module.exports.likeCard = async (req, res) => {
  try {
    const data = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    const owner = req.user._id;
    const
      {
        likes, _id, name, link, createdAt,
      } = data;
    res.status(200).json({
      likes, _id, name, link, owner, createdAt,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(400).send({
        message: 'Переданы некорректные данные для постановки/снятии лайка',
      });
      return;
    } else if (err.name === 'TypeError') {
      res.status(404).send({
        message: 'Передан несуществующий _id карточки',
      });
      return;
    } else {
      res.status(500).send({ message: 'Ошибка по умолчанию' });
    }
  }
};

// убрать лайк с карточки
module.exports.dislikeCard = async (req, res) => {
  try {
    const data = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    const owner = req.user._id;
    const {
      likes, _id, name, link, createdAt,
    } = data;
    res.status(200).json({
      likes, _id, name, link, owner, createdAt,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(400).send({
        message: 'Переданы некорректные данные для постановки/снятии лайка',
      });
      return;
    } else if (err.name === 'TypeError') {
      res.status(404).send({
        message: 'Передан несуществующий _id карточки',
      });
      return;
    } else {
      res.status(500).send({ message: 'Ошибка по умолчанию' });
    }
  }
};
