const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userController = require('../controllers/users');
const auth = require('../midlewares/auth');

userRouter.get('/users', auth, userController.getUsers);
userRouter.get('/users/me', auth, userController.getCurrentUser);
userRouter.get('/users/:userId', auth, celebrate({
  params: Joi.object().keys({
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
}), userController.getOneUser);
userRouter.patch('/users/me', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), userController.updateUser);
userRouter.patch('/users/me/avatar', auth, celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/),
  }),
}), userController.updateAvatar);

module.exports = userRouter;
