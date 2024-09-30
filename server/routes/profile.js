const express = require('express');
const Profile = require('../models/Profile');
const authMiddleware = require('../middleware/auth'); // middleware для проверки JWT
const router = express.Router();

// Получение профиля пользователя
router.get('/', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

// Обновление профиля пользователя
router.post('/update', authMiddleware, async (req, res) => {
  const { name, jobTitle, company, phoneNumber, socialLinks } = req.body;

  try {
    let profile = await Profile.findOne({ userId: req.user.userId });

    if (!profile) {
      profile = new Profile({ userId: req.user.userId, name, jobTitle, company, phoneNumber, socialLinks });
      await profile.save();
      return res.status(201).json({ message: 'Profile created', profile });
    }

    // Обновляем существующий профиль
    profile.name = name;
    profile.jobTitle = jobTitle;
    profile.company = company;
    profile.phoneNumber = phoneNumber;
    profile.socialLinks = socialLinks;

    await profile.save();
    res.json({ message: 'Profile updated', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
});

// Удаление профиля пользователя
router.delete('/delete', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ userId: req.user.userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile', error });
  }
});

module.exports = router;
// Получение списка профилей с пагинацией и фильтрацией
router.get('/list', authMiddleware, async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
  
    try {
      // Фильтрация по имени (можно расширить на другие поля)
      const query = search ? { name: { $regex: search, $options: 'i' } } : {};
  
      const profiles = await Profile.find(query)
        .limit(limit * 1) // Лимит на странице
        .skip((page - 1) * limit) // Пропуск записей для пагинации
        .exec();
  
      // Получаем общее количество документов
      const count = await Profile.countDocuments(query);
  
      res.json({
        profiles,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching profiles', error });
    }
  });
  