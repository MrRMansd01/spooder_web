const express = require('express');
const supabase = require('../supabaseClient');
const router = express.Router();

// ==========================================================
// Middleware برای بررسی توکن و احراز هویت
// ==========================================================
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error during authentication' });
    }
};




// مسیر ثبت‌نام
router.post('/register', async (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ error: 'ایمیل، رمز عبور و نام کاربری الزامی است.' });
    }
    try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email, password, email_confirm: true, user_metadata: { username }
        });
        if (authError) return res.status(400).json({ error: authError.message });

        const { error: profileError } = await supabase
            .from('profiles')
            .insert({ id: authData.user.id, username, email });

        if (profileError) {
            await supabase.auth.admin.deleteUser(authData.user.id);
            return res.status(500).json({ error: 'خطا در ساخت پروفایل کاربر.' });
        }
        res.status(201).json({ message: 'کاربر با موفقیت ساخته شد.', user: authData.user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// مسیر ورود
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'ایمیل و رمز عبور الزامی است.' });
    }
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return res.status(401).json({ error: 'ایمیل یا رمز عبور نامعتبر است.' });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/logout', authMiddleware, async (req, res) => {
    try {
        // توکن کاربر از هدر خوانده شده و برای خروج به سوپربیس ارسال می‌شود
        const token = req.headers.authorization.split(' ')[1];
        const { error } = await supabase.auth.signOut(token);

        if (error) {
            console.error("Supabase signout error:", error.message);
            // حتی در صورت خطا، به فرانت‌اند پاسخ موفقیت‌آمیز می‌دهیم تا کاربر خارج شود
        }
        
        res.status(200).json({ message: 'کاربر با موفقیت خارج شد.' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ==========================================================
// اکسپورت کردن هر دو بخش
// ==========================================================
module.exports = {
    router, // مسیرهای /login و /register
    authMiddleware // تابع بررسی توکن
};
