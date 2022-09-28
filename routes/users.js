const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userController = require('../controllers/users');
const auth = require('../midlewares/auth');

userRouter.get('/users', userController.getUsers);
userRouter.get('/users/me', userController.getCurrentUser);
userRouter.get('/users/:userId', celebrate({
  body: Joi.object().keys({
    _id: Joi.string().min(24).max(24),
}),
}), userController.getOneUser);
userRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), userController.updateUser);
userRouter.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().domain(),
  }),
}), userController.updateAvatar);

module.exports = userRouter;
