const userRouter = require('express').Router();
const userController = require('../controllers/users');

userRouter.get('/users', userController.getUsers);
userRouter.get('/users/me', userController.getCurrentUser);
userRouter.get('/users/:userId', userController.getOneUser);
// userRouter.post('/users', userController.createUser);
userRouter.patch('/users/me', userController.updateUser);
userRouter.patch('/users/me/avatar', userController.updateAvatar);

module.exports = userRouter;
