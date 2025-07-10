const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { authMiddleware } = require('./auth');

// تابع کمکی برای تبدیل دقایق به فرمت "ساعت و دقیقه"
const formatMinutes = (minutes) => {
    if (!minutes || minutes < 0) return '0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};

// تابع کمکی برای محاسبه اختلاف زمان بین دو رشته 'HH:MM'
const calculateDurationInMinutes = (timeStart, timeEnd) => {
    try {
        if (!timeStart || !timeEnd) return 0;
        const [startH, startM] = timeStart.split(':').map(Number);
        const [endH, endM] = timeEnd.split(':').map(Number);
        const startTimeInMinutes = startH * 60 + startM;
        const endTimeInMinutes = endH * 60 + endM;
        if (endTimeInMinutes < startTimeInMinutes) return 0;
        return endTimeInMinutes - startTimeInMinutes;
    } catch (e) {
        console.error("Invalid time format for calculation:", timeStart, timeEnd);
        return 0;
    }
};

// @route   GET /api/room/data
// @desc    دریافت اطلاعات جدول امتیازات با محاسبه پویا
// @access  Private
router.get('/data', authMiddleware, async (req, res) => {
    try {
        // ۱. دریافت تمام تسک‌های تکمیل شده و خواندن ستون color برای امتیاز
        const { data: completedTasks, error: tasksError } = await supabase
            .from('tasks')
            .select('user_id, time_start, time_end, color') // به جای score، ستون color را می‌خوانیم
            .eq('is_completed', true);

        if (tasksError) throw tasksError;

        // ۲. محاسبه مجموع زمان و امتیاز برای هر کاربر
        const userStats = {};
        for (const task of completedTasks) {
            if (!userStats[task.user_id]) {
                userStats[task.user_id] = { totalTime: 0, totalScore: 0 };
            }
            userStats[task.user_id].totalTime += calculateDurationInMinutes(task.time_start, task.time_end);
            // مقدار ستون color را به عنوان امتیاز در نظر می‌گیریم و به عدد تبدیل می‌کنیم
            userStats[task.user_id].totalScore += (Number(task.color) || 0);
        }

        // ۳. دریافت تمام پروفایل‌ها برای گرفتن نام و آواتار
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url');

        if (profilesError) throw profilesError;

        // ۴. ادغام اطلاعات پروفایل با آمار محاسبه شده
        const combinedData = profiles.map(profile => ({
            ...profile,
            total_time_minutes: userStats[profile.id]?.totalTime || 0,
            score: userStats[profile.id]?.totalScore || 0, // نام پراپرتی score باقی می‌ماند تا فرانت‌اند دچار خطا نشود
        }));

        // ۵. ساخت جدول امتیازات بر اساس داده‌های ادغام شده
        const timeLeaderboard = [...combinedData]
            .sort((a, b) => b.total_time_minutes - a.total_time_minutes)
            .slice(0, 5)
            .map(p => ({
                name: p.username,
                value: formatMinutes(p.total_time_minutes),
                avatarUrl: p.avatar_url || `https://placehold.co/40x40/E6A4B4/FFFFFF?text=${p.username.charAt(0)}`
            }));

        const scoreLeaderboard = [...combinedData]
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(p => ({
                name: p.username,
                value: `${p.score} pts`,
                avatarUrl: p.avatar_url || `https://placehold.co/40x40/E6A4B4/FFFFFF?text=${p.username.charAt(0)}`
            }));

        res.json({
            leaderboard: { time: timeLeaderboard, score: scoreLeaderboard },
            stats: { completed: 0, pending: 0, totalTime: '0m' }
        });

    } catch (error) {
        console.error("Error fetching dynamic room data:", error);
        res.status(500).json({ error: 'Failed to fetch room data' });
    }
});

module.exports = router;
