const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { authMiddleware } = require('./auth');

// @route   GET /api/profile/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('username, name, email, avatar_url')
            .eq('id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!profile) return res.status(404).json({ msg: 'Profile not found' });

        res.json(profile);
    } catch (err) {
        console.error("Error fetching profile:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/profile/me
router.put('/me', authMiddleware, async (req, res) => {
    // **اصلاح اصلی**: avatar_url را هم از body درخواست می‌خوانیم
    const { username, name, avatar_url } = req.body;

    const profileFields = {};
    if (username) profileFields.username = username;
    if (name) profileFields.name = name;
    // اگر آدرس آواتار در درخواست وجود داشت، آن را هم به آبجکت آپدیت اضافه می‌کنیم
    if (avatar_url) profileFields.avatar_url = avatar_url;
    profileFields.updated_at = new Date();

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(profileFields)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        
        res.json(data);
    } catch (err) {
        console.error("Error updating profile:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
