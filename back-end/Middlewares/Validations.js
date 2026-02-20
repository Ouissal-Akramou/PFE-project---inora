import { check, validationResult } from 'express-validator';

export const validations = {
    login: [
        check('email')
        .isEmail()
        .withMessage('Invalid email'),
        check('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters long'),
    ],
    register: [
        check('fullName')
        .isLength({min: 3})
        .withMessage("Full name must be at least 3 characters long"),
        check('email')
        .isEmail()
        .withMessage('Invalid email'),
        check('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters long'),
        check('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),
    ],
    resetPassword: [
         check('token')
        .notEmpty()
        .withMessage('Reset token is required'),
        check('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters long'),

        check('confirmPassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),
    ],
    forgotPassword: [
        check('email')
        .isEmail()
        .withMessage('Invalid email'),
    ],

}

// Middleware to handle validation errors
export const errorValidatorHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg
        });
    }
    next();
};

export default { validations, errorValidatorHandler };