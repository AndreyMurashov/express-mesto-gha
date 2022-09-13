const cardRouter = require('express').Router();
const cardController = require('../controllers/cards');

cardRouter.get('/cards', cardController.getCards);
cardRouter.post('/cards', cardController.createCard);
cardRouter.delete('/cards/:cardId', cardController.removeCard);
cardRouter.put('/cards/:cardId/likes', cardController.likeCard);
cardRouter.delete('/cards/:cardId/likes', cardController.dislikeCard);

module.exports = cardRouter;
