import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient'; // کلاینت سوپربیس فرانت‌اند
import Footer from '../components/Footer';
import './MyAccount.css';

const MyAccount = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', username: '', email: '' });
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const getAuthToken = useCallback(() => {
        const sessionDataString = localStorage.getItem('supabaseSession');
        if (!sessionDataString) {
            navigate('/join');
            return null;
        }
        return JSON.parse(sessionDataString).access_token;
    }, [navigate]);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = getAuthToken();
            if (!token) return;

            try {
                const response = await axios.get('http://localhost:3001/api/profile/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setFormData({
                    name: response.data.name || '',
                    username: response.data.username || '',
                    email: response.data.email || ''
                });
                setAvatarUrl(response.data.avatar_url || 'https://placehold.co/120x120/E6A4B4/FFFFFF?text=A');
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [getAuthToken]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChangeAndUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const token = getAuthToken();
        if (!token) return;

        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `public/${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('spooderimage')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('spooderimage')
                .getPublicUrl(filePath);
            
            const publicUrl = data.publicUrl;
            
            await axios.put('http://localhost:3001/api/profile/me', 
                { avatar_url: publicUrl },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setAvatarUrl(publicUrl);
            alert("Avatar updated successfully!");

        } catch (error) {
            console.error("Error uploading avatar:", error);
            alert("Failed to upload avatar.");
        } finally {
            setUploading(false);
        }
    };


    const handleSaveChanges = async () => {
        const token = getAuthToken();
        if (!token) return;

        setUploading(true); // از همان state لودینگ استفاده می‌کنیم
        try {
            await axios.put('http://localhost:3001/api/profile/me', 
                { name: formData.name, username: formData.username },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Profile details updated successfully!");
            navigate('/accent');
        } catch (error) {
            console.error("Error saving profile details:", error);
            alert("Failed to save changes.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="page-container"><p>Loading profile...</p></div>;
    }

    return (
        <div className="page-container">
            <div className="my-account-content">
                <header className="my-account-header">
                    <button onClick={() => navigate(-1)} className="back-button">←</button>
                    <h1>Edit Profile</h1>
                </header>

                <div className="profile-picture-section">
                    <img src={avatarUrl} alt="Profile" className="profile-picture" />
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChangeAndUpload} 
                    />
                    <button 
                        className="change-picture-btn" 
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Uploading...' : 'Change Picture'}
                    </button>
                </div>

                <form className="edit-profile-form">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} readOnly disabled />
                    </div>
                    <button 
                        type="button" 
                        onClick={handleSaveChanges} 
                        className="save-changes-btn"
                        disabled={uploading}
                    >
                        {uploading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default MyAccount;
