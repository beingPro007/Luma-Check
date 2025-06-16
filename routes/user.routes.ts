import { Router } from 'express';
import {
  forgotPasswordRequest,
  loginUser,
  logoutUser,
  registerUser,
  resetForgottenPassword,
  updateUser,
} from '../controller/user.controller';
import { verifyJWT } from '../middleware/verifyJwt';
import {validateResetToken} from "../utils/validateResetToken"

const router = Router();

router.route('/sign-up').post(registerUser);

router.route('/sign-in').post(loginUser);

router.route('/sign-out').post(verifyJWT,logoutUser)

router.route('/update-user').patch(verifyJWT, updateUser);

router.route('/request-forgot-password').post(verifyJWT, forgotPasswordRequest);

router
  .route('/reset-forgotten-password/:id')
  .get(validateResetToken)
  .patch(resetForgottenPassword);

export const userRoutes = router;