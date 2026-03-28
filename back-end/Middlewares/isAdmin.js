import auth from './auth.js';

// chains auth first, then checks role — no duplicated token logic
const isAdmin = [
  auth,
  (req, res, next) => {
    if (req.user?.role !== 'admin')
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    next();
  }
];

export default isAdmin;
