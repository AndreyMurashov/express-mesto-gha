const cardRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const cardController = require('../controllers/cards');
const auth = require('../midlewares/auth');

cardRouter.get('/cards', cardController.getCards);
cardRouter.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(3),
    link: Joi.string().required(),
  }),
}), cardController.createCard);
cardRouter.delete('/cards/:cardId', auth, cardController.removeCard);
cardRouter.put('/cards/:cardId/likes', cardController.likeCard);
cardRouter.delete('/cards/:cardId/likes', cardController.dislikeCard);

module.exports = cardRouter;
