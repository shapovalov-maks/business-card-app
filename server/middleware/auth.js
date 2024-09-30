const jwt = require('jsonwebtoken');

// Middleware для проверки JWT токена
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret'); // Расшифровка токена
    req.user = decoded; // Добавляем расшифрованные данные в запрос
    next(); // Продолжаем выполнение
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
