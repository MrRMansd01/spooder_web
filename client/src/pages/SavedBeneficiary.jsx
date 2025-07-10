import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SavedBeneficiary.css';

const SavedBeneficiary = () => {
    const navigate = useNavigate();
    const trophies = [
        { name: 'First Task', score: 10, category: 'Milestone' },
        { name: 'Perfect Week', score: 50, category: 'Achievement' },
        { name: '100 Hours Focused', score: 100, category: 'General' },
    ];
    const totalScore = trophies.reduce((sum, trophy) => sum + trophy.score, 0);
    return (
            <div className="trophy-content">
                <header className="trophy-header">
                    <button onClick={() => navigate(-1)} className="back-button">←</button>
                    <h1>Gems & Points</h1>
                </header>

                <div className="trophy-stats-card">
                    <div className="stat-item">
                        <span className="stat-value">{trophies.length}</span>
                        <span className="stat-label">Trophies</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{totalScore}</span>
                        <span className="stat-label">Total Score</span>
                    </div>
                </div>

                <div className="trophy-list">
                    {trophies.map((trophy, index) => (
                        <div key={index} className="trophy-item">
                            <div className="trophy-icon">{trophy.category.charAt(0)}</div>
                            <div className="trophy-details">
                                <p className="trophy-name">{trophy.name}</p>
                                <p className="trophy-category">{trophy.category}</p>
                            </div>
                            <span className="trophy-score">{trophy.score} pts</span>
                        </div>
                    ))}
                </div>
        </div>
        
    );
};

export default SavedBeneficiary;
