import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import './Room.css';

// کامپوننت تایمر پومودورو
const PomodoroTimer = ({ onSessionComplete }) => {
  const FOCUS_TIME = 25;
  const BREAK_TIME = 5;

  const [minutes, setMinutes] = useState(FOCUS_TIME);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(s => s - 1);
        } else if (minutes > 0) {
          setMinutes(m => m - 1);
          setSeconds(59);
        } else {
          if (!isBreak) {
            onSessionComplete(FOCUS_TIME, 10);
          }
          const newIsBreak = !isBreak;
          setIsBreak(newIsBreak);
          setMinutes(newIsBreak ? BREAK_TIME : FOCUS_TIME);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, isBreak, onSessionComplete]);

  const totalDuration = (isBreak ? BREAK_TIME : FOCUS_TIME) * 60;
  const timeRemaining = minutes * 60 + seconds;
  const progress = (totalDuration - timeRemaining) / totalDuration;

  return (
    <div className="pomodoro-timer">
      <div className="timer-circle-container">
        <svg className="timer-svg" viewBox="0 0 100 100">
          <circle className="timer-background" cx="50" cy="50" r="45"></circle>
          <circle 
            className={`timer-progress ${isBreak ? 'break' : 'focus'}`} 
            cx="50" cy="50" r="45"
            strokeDasharray="283"
            strokeDashoffset={283 - (progress * 283)}
          ></circle>
        </svg>
        <div className="timer-text">
          <div className="time-display">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</div>
          <div className="time-label">{isBreak ? 'Break' : 'Focus'}</div>
        </div>
      </div>
      <button onClick={() => setIsActive(!isActive)} className="timer-button">
        {isActive ? 'Pause' : 'Start'}
      </button>
    </div>
  );
};

// کامپوننت اصلی صفحه
const Room = () => {
  const [leaderboard, setLeaderboard] = useState({ time: [], score: [] });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getAuthToken = useCallback(() => {
    const sessionDataString = localStorage.getItem('supabaseSession');
    if (!sessionDataString) {
        navigate('/join');
        return null;
    }
    return JSON.parse(sessionDataString).access_token;
  }, [navigate]);

  const fetchData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      // ارسال یک درخواست به مسیر جدید
      const response = await axios.get('http://localhost:3001/api/room/data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLeaderboard(response.data.leaderboard);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching room data:", error);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSessionComplete = async (duration, points) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      await axios.post('http://localhost:3001/api/room/complete-session', 
        { duration, points },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  return (
      <div className="room-content">
        <header className="room-header">
          <h1>Pomodoro Timer</h1>
        </header>
        <div className="timer-and-stats-container">
          <PomodoroTimer onSessionComplete={handleSessionComplete} />
        </div>
        {loading ? <p>Loading stats...</p> : (
          <div className="stats-bar">
            <div className="stat-item"><span className="stat-value green">{stats.completed}</span><span className="stat-label">Completed</span></div>
            <div className="stat-divider"></div>
            <div className="stat-item"><span className="stat-value yellow">{stats.pending}</span><span className="stat-label">Pending</span></div>
            <div className="stat-divider"></div>
            <div className="stat-item"><span className="stat-value black">{stats.totalTime}</span><span className="stat-label">Total Time</span></div>
          </div>
        )}
        {loading ? <p>Loading leaderboard...</p> : (
          <div className="leaderboard-card">
            <h2>Leaderboard</h2>
            <div className="leaderboard-section">
              <h3>Time</h3>
              {leaderboard.time.map((user, index) => (
                <div key={index} className="leaderboard-row">
                  <div className="user-info"><img src={user.avatarUrl} alt={user.name} className="avatar" /><span>{user.name}</span></div>
                  <span className="user-metric">{user.value}</span>
                </div>
              ))}
            </div>
            <div className="leaderboard-section">
              <h3>Score</h3>
              {leaderboard.score.map((user, index) => (
                <div key={index} className="leaderboard-row">
                  <div className="user-info"><img src={user.avatarUrl} alt={user.name} className="avatar" /><span>{user.name}</span></div>
                  <span className="user-metric">{user.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      <Footer />
    </div>
  );
};

export default Room;
