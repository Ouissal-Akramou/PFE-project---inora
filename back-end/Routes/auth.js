import express from "express";
const router = express.Router();
import { login, register, resetPassword, forgotPassword, logout} from '../Controllers/auth.js';

import { validations, errorValidatorHandler} from '../Middlewares/Validations.js';

router.post("/login", validations.login, errorValidatorHandler, login);
router.post("/register", validations.register, errorValidatorHandler, register);
router.post("/reset-password", validations.resetPassword, errorValidatorHandler, resetPassword);
router.post("/forgot-password", validations.forgotPassword, errorValidatorHandler, forgotPassword);
router.post("/logout",logout)

export default router;