const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { authMiddleware } = require('./auth'); // Middleware را از فایل auth.js وارد می‌کنیم

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.query;

        let query = supabase.from('tasks').select('*').eq('user_id', userId);
        if (date) {
            query = query.eq('date', date);
        }
        query = query.order('created_at', { ascending: false });
        
        const { data: tasks, error } = await query;
            
        if (error) throw error;
        res.json(tasks);
    } catch (err) {
        console.error("Error fetching tasks:", err.message);
        res.status(500).send('Server Error');
    }
});
router.post('/', authMiddleware, async (req, res) => {
    // اطلاعات تسک جدید از body درخواست خوانده می‌شود
    const { title, date, time_start, color } = req.body;
    const userId = req.user.id;

    if (!title) {
        return res.status(400).json({ error: 'عنوان تسک الزامی است.' });
    }

    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                { 
                    user_id: userId, 
                    title, 
                    date, 
                    time_start, 
                    color, 
                    is_completed: false 
                }
            ])
            .select() // برای اینکه تسک ساخته‌شده را برگرداند
            .single(); // چون فقط یک آیتم اضافه کردیم

        if (error) throw error;
        
        res.status(201).json(data); // پاسخ موفقیت‌آمیز با کد 201 (Created)
    } catch (err) {
        console.error("Error creating task:", err.message);
        res.status(500).send('Server Error');
    }
});

router.patch('/:id/complete', authMiddleware, async (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;

    try {
        const { data, error } = await supabase
            .from('tasks')
            .update({ is_completed: true, updated_at: new Date() })
            .eq('id', taskId)
            .eq('user_id', userId) // بسیار مهم: کاربر فقط می‌تواند تسک خودش را آپدیت کند
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'تسک مورد نظر یافت نشد.' });

        res.json(data);
    } catch (err) {
        console.error("Error completing task:", err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================================
//  ۴. حذف یک تسک (DELETE /api/tasks/:id)
// ==========================================================
router.delete('/:id', authMiddleware, async (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;

    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)
            .eq('user_id', userId); // بسیار مهم: کاربر فقط می‌تواند تسک خودش را حذف کند

        if (error) throw error;

        res.json({ message: 'تسک با موفقیت حذف شد.' });
    } catch (err) {
        console.error("Error deleting task:", err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
