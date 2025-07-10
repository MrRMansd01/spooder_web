const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { authMiddleware } = require('./auth');

// @route   GET /api/channels
// @desc    دریافت کانال‌هایی که کاربر عضو آنهاست
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: memberEntries, error: memberError } = await supabase
            .from('channel_members')
            .select('channel_id')
            .eq('user_id', userId);

        if (memberError) throw memberError;
        if (!memberEntries || memberEntries.length === 0) return res.json([]);

        const channelIds = memberEntries.map(entry => entry.channel_id);
        const { data: channels, error: channelsError } = await supabase
            .from('channels')
            .select('*')
            .in('id', channelIds);

        if (channelsError) throw channelsError;
        res.json(channels);
    } catch (error) {
        console.error("Error fetching channels:", error.message);
        res.status(500).send('Server Error');
    }
});
// @route   POST /api/channels
// @desc    ایجاد یک کانال چت جدید
router.post('/', authMiddleware, async (req, res) => {
    // **اصلاح اصلی**: created_by حذف شد و image_url اضافه شد
    const { name, member_ids, imageUrl } = req.body;
    const creatorId = req.user.id;

    if (!name || !member_ids || member_ids.length === 0) {
        return res.status(400).json({ error: 'نام کانال و حداقل یک عضو دیگر الزامی است.' });
    }

    try {
        const { data: newChannel, error: channelError } = await supabase
            .from('channels')
            .insert({ name, imageUrl }) // فیلد created_by حذف شد
            .select()
            .single();
        if (channelError) throw channelError;

        const allMemberIds = [...new Set([creatorId, ...member_ids])];
        const membersToInsert = allMemberIds.map(userId => ({
            channel_id: newChannel.id,
            user_id: userId
        }));

        const { error: membersError } = await supabase.from('channel_members').insert(membersToInsert);
        if (membersError) throw membersError;

        res.status(201).json(newChannel);
    } catch (error) {
        console.error("Error creating channel:", error.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/channels/users
// @desc    دریافت لیست تمام کاربران برای افزودن به چت
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .neq('id', req.user.id); // کاربر فعلی را از لیست حذف می‌کنیم

        if (error) throw error;
        res.json(profiles);
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
