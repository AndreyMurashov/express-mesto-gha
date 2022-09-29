const cardRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const cardController = require('../controllers/cards');
const auth = require('../midlewares/auth');

cardRouter.get('/cards', auth, cardController.getCards);
cardRouter.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required(),
  }),
}), cardController.createCard);
cardRouter.delete('/cards/:cardId', auth, celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
}), cardController.removeCard);
cardRouter.put('/cards/:cardId/likes', auth, celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
}), cardController.likeCard);
cardRouter.delete('/cards/:cardId/likes', auth, celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
}), cardController.dislikeCard);

module.exports = cardRouter;
