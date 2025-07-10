import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutApp.css';

const AboutApp = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container">
            <div className="about-content">
                <header className="about-header">
                    <button onClick={() => navigate(-1)} className="back-button">←</button>
                    <h1>About Spooder</h1>
                </header>
                <div className="about-section">
                    <h2>Privacy Policy</h2>
                    <p>
                        Spooder collects minimal personal information to provide and improve our services. We use this data to authenticate and manage your account, sync your data across devices, and enhance app functionality.
                    </p>
                </div>
                <div className="about-section">
                    <h2>Data Security</h2>
                    <p>
                        We implement industry-standard security measures to protect your personal information. All data is encrypted during transmission and storage.
                    </p>
                </div>
                <div className="about-section">
                    <p className="last-updated">Last Updated: July 2025</p>
                </div>
            </div>
        </div>
    );
};

export default AboutApp;
