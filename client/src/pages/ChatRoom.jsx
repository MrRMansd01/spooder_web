import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import api from '../api';
import './ChatRoom.css';

// کلاینت سوپابیس برای قابلیت‌های لحظه‌ای (Real-time) و آپلود فایل
const supabaseUrl = 'https://lholzspyazziknxqopmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob2x6c3B5YXp6aWtueHFvcG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMjc0MTAsImV4cCI6MjA1NzYwMzQxMH0.uku06OF-WapBhuV-A_rJBXu3x24CKKkSTM0SnmPIOOE';
const supabase = createClient(supabaseUrl, supabaseKey);

// هوک برای دریافت اطلاعات کاربر فعلی
const useAuth = () => {
    const sessionData = localStorage.getItem('supabaseSession');
    if (!sessionData) return { user: null };
    try {
        const session = JSON.parse(sessionData);
        return { user: session.user };
    } catch (error) {
        console.error("Error parsing session data:", error);
        return { user: null };
    }
};

// آیکون‌های SVG
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
);

const AttachmentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
);


const ChatRoom = () => {
    const { channelId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/messages/${channelId}`);
                setMessages(response.data);
            } catch (error) {
                if (error.response?.status !== 401) {
                    console.error("Failed to fetch messages.", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        const subscription = supabase
            .channel(`public:messages:channel_id=eq.${channelId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    setMessages((prevMessages) => {
                        if (prevMessages.some(msg => msg.id === payload.new.id)) {
                            return prevMessages;
                        }
                        // برای پیام‌های دریافتی از دیگران، نیاز به واکشی اطلاعات پروفایل داریم
                        const fetchSenderProfile = async () => {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('id, username, avatar_url')
                                .eq('id', payload.new.sender_id)
                                .single();
                            
                            const messageWithProfile = { ...payload.new, sender_id: profile };
                            setMessages(prev => [...prev, messageWithProfile]);
                        };
                        
                        // فقط اگر پیام از کاربر دیگری بود، پروفایل را واکشی کن
                        if (payload.new.sender_id !== currentUser?.id) {
                            fetchSenderProfile();
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [channelId, currentUser?.id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        try {
            const response = await api.post(`/messages/${channelId}`, { content: newMessage });
            // به‌روزرسانی لحظه‌ای UI با پاسخی که از سرور می‌آید
            setMessages(prevMessages => [...prevMessages, response.data]);
            setNewMessage('');
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Error sending message:", error);
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        const fileName = `${currentUser.id}/${Date.now()}`;
        try {
            const { error: uploadError } = await supabase.storage
                .from('spooderimage')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('spooderimage')
                .getPublicUrl(fileName);

            const response = await api.post(`/messages/${channelId}`, { imageUrl: publicUrl });
            // به‌روزرسانی لحظه‌ای UI با پیام حاوی تصویر
            setMessages(prevMessages => [...prevMessages, response.data]);

        } catch (error) {
            console.error("Error uploading image or sending message:", error);
        }
    };

    if (loading) return <div className="page-container">در حال بارگذاری پیام‌ها...</div>;

    return (
        <div className="chat-room-container">
            <header className="chat-room-header">
                <button onClick={() => navigate(-1)} className="back-button">←</button>
                <h3>چت‌روم</h3>
            </header>

            <main className="message-list">
                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} isCurrentUser={msg.sender_id?.id === currentUser?.id} />
                ))}
                <div ref={messagesEndRef} />
            </main>

            <footer className="message-input-area">
                <form onSubmit={handleSendMessage} className="message-form">
                    <button type="button" onClick={() => fileInputRef.current.click()} className="icon-button">
                        <AttachmentIcon />
                    </button>
                    <input
                        type="text"
                        placeholder="پیام خود را بنویسید..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="message-input"
                    />
                    <button type="submit" className="icon-button send-button">
                        <SendIcon />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                </form>
            </footer>
        </div>
    );
};

const MessageBubble = ({ message, isCurrentUser }) => {
    const sender = message.sender_id;
    if (!sender) return null;

    const senderName = isCurrentUser ? 'شما' : sender.username;
    const avatarUrl = sender.avatar_url || `https://placehold.co/30x30/cccccc/FFFFFF?text=${senderName.charAt(0).toUpperCase()}`;

    return (
        <div className={`message-bubble-wrapper ${isCurrentUser ? 'me' : 'other'}`}>
            {!isCurrentUser && <img src={avatarUrl} alt="avatar" className="chat-avatar" />}
            <div className="message-content">
                {!isCurrentUser && <div className="sender-name">{senderName}</div>}
                <div className="message-bubble">
                    {message.imageUrl ? (
                        <img src={message.imageUrl} alt="sent content" className="message-image" />
                    ) : (
                        message.content
                    )}
                </div>
            </div>
            {isCurrentUser && <img src={avatarUrl} alt="avatar" className="chat-avatar" />}
        </div>
    );
};

export default ChatRoom;
