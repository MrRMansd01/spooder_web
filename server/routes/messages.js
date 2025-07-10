const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { authMiddleware } = require('./auth');

// مسیر GET بدون تغییر باقی می‌ماند (از نسخه قبلی که کار می‌کرد استفاده می‌کنیم)
router.get('/:channelId', authMiddleware, async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user.id;

    try {
        const { data: member, error: memberError } = await supabase
            .from('channel_members')
            .select('user_id')
            .eq('channel_id', channelId)
            .eq('user_id', userId)
            .single();

        if (memberError && memberError.code !== 'PGRST116') throw memberError;
        if (!member) {
            return res.status(403).json({ error: 'Forbidden: You are not a member of this channel.' });
        }

        const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('channel_id', channelId)
            .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        if (!messages || messages.length === 0) return res.json([]);

        const senderIds = [...new Set(messages.map(msg => msg.sender_id).filter(id => id))];
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', senderIds);
        
        if (profilesError) throw profilesError;

        const profilesMap = new Map(profiles.map(p => [p.id, p]));
        const formattedMessages = messages.map(msg => ({
            ...msg,
            sender_id: profilesMap.get(msg.sender_id) || null
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error("Internal Server Error in GET /messages:", error.message);
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
});


// @route   POST /api/messages/:channelId
// @desc    ارسال یک پیام جدید در کانال (با لایه محافظتی)
router.post('/:channelId', authMiddleware, async (req, res) => {
    const { channelId } = req.params;
    const { content, imageUrl } = req.body;
    const userId = req.user?.id; // استفاده از optional chaining برای اطمینان

    // ۱. بررسی امنیتی: چک می‌کنیم که آیا شناسه کاربر معتبر است یا خیر
    if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
        return res.status(401).json({ error: 'Unauthorized: Invalid user ID.' });
    }

    if (!content && !imageUrl) {
        return res.status(400).json({ error: 'Message content or image URL cannot be empty.' });
    }

    try {
        // ۲. اکنون با اطمینان از معتبر بودن userId، پیام را ثبت می‌کنیم
        const { data: newMessage, error } = await supabase
            .from('messages')
            .insert({ channel_id: channelId, sender_id: userId, content, imageUrl })
            .select()
            .single();

        if (error) {
             // اگر خطا از نوع کلید خارجی بود، جزئیات بیشتری نمایش بده
            if (error.code === '23503') {
                console.error('Foreign key violation:', error.details);
                return res.status(400).json({ error: 'Invalid sender ID provided.' });
            }
            throw error;
        }

        const { data: userProfile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', userId)
            .single();

        res.status(201).json({ ...newMessage, sender_id: userProfile });
    } catch (error) {
        console.error("Internal Server Error in POST /messages:", error.message);
        res.status(500).json({ error: 'Server Error', details: error.message });
    }
});

module.exports = router;
