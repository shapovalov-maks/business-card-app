const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const profileRoutes = require('./routes/profile'); // маршрут для профилей

const app = express();

// Middleware для работы с JSON и CORS
app.use(express.json());
app.use(cors());

// Конфигурация MongoDB
const mongoURI = 'mongodb://localhost:27017/business-card-app';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Модель пользователя
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Регистрация пользователя
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Проверка, существует ли пользователь
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Авторизация пользователя
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Проверка, существует ли пользователь
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Генерация JWT токена
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Если токена нет, возвращаем ошибку 401
  }

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.sendStatus(403); // Если токен недействителен, возвращаем ошибку 403
    }
    req.user = user; // Добавляем информацию о пользователе в запрос
    next(); // Переходим к следующей функции
  });
};

// Пример защищённого маршрута
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Маршрут для профиля
app.use('/profile', profileRoutes);

// Запуск сервера
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Тестовый маршрут для проверки работы сервера
app.get('/', (req, res) => {
  res.send('Welcome to Business Card App');
});
const morgan = require('morgan');

// Логирование запросов с помощью morgan
app.use(morgan('dev')); // Для базового логирования запросов
const logger = require('./logger');

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Пример использования winston в маршрутах
app.get('/', (req, res) => {
  logger.info('Главная страница запрошена');
  res.send('Welcome to Business Card App');
});
const morgan = require('morgan');
app.use(morgan('dev')); // режим логирования для разработки
