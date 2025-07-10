import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import Footer from '../components/Footer';
import './Calendar.css';

// توابع کمکی
const addDays = (date, days) => { const r = new Date(date); r.setDate(r.getDate() + days); return r; };
const formatDate = (date, options) => date.toLocaleDateString('en-US', options);
const toYYYYMMDD = (date) => date.toISOString().split('T')[0];

// کامپوننت مودال افزودن تسک (بدون تغییر)
const AddTaskModal = ({ onClose, onAddTask, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return alert("Please enter a title.");
    onAddTask({
      title,
      time_start: startTime || 'Any Time',
      color: selectedCategory.toString(),
      date: toYYYYMMDD(selectedDate),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>New Task for {formatDate(selectedDate, { month: 'long', day: 'numeric' })}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </header>
        <form onSubmit={handleSubmit} className="add-task-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title"/>
          </div>
          <div className="form-group">
            <label htmlFor="start-time">Time</label>
            <input type="time" id="start-time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <div className="category-selector">
              <button type="button" className={`cat-btn cat-1 ${selectedCategory === 1 ? 'active' : ''}`} onClick={() => setSelectedCategory(1)}>score 1</button>
              <button type="button" className={`cat-btn cat-2 ${selectedCategory === 2 ? 'active' : ''}`} onClick={() => setSelectedCategory(2)}>score 2</button>
              <button type="button" className={`cat-btn cat-3 ${selectedCategory === 3 ? 'active' : ''}`} onClick={() => setSelectedCategory(3)}>score 3</button>
            </div>
          </div>
          <button type="submit" className="create-task-button">Create New Task</button>
        </form>
      </div>
    </div>
  );
};

// کامپوننت آیتم تسک با قابلیت Swipe
const CalendarTaskItem = ({ task, onComplete, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const handlers = useSwipeable({
    onSwipedRight: () => !task.is_completed && onComplete(task.id),
    onSwipedLeft: () => !task.is_completed && setShowDeleteConfirm(true),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  });
  const getTaskColor = (color) => ({'1': '#2BBA90', '2': '#ECB800', '3': '#EC0000'}[color] || '#2BBA90');

  return (
    <div {...handlers} className="calendar-task-item-wrapper">
      <div className="swipe-action-background complete">✓ Complete</div>
      <div className={`calendar-task-item ${task.is_completed ? 'completed' : ''} ${showDeleteConfirm ? 'reveal-delete' : ''}`}>
        <div className="task-color-indicator" style={{backgroundColor: getTaskColor(task.color)}}></div>
        <div className="task-item-details">
          <p className="task-item-title">{task.title}</p>
          <p className="task-item-time">{task.time_start}</p>
        </div>
      </div>
      <div className="delete-confirm-container">
        <button onClick={() => onDelete(task.id)} className="delete-btn">Delete</button>
        <button onClick={() => setShowDeleteConfirm(false)} className="cancel-btn">Cancel</button>
      </div>
    </div>
  );
};

// کامپوننت اصلی صفحه تقویم
const Calendar = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const dateInputRef = useRef(null);

    // تابع برای گرفتن توکن از localStorage
    const getAuthToken = () => {
        const sessionDataString = localStorage.getItem('supabaseSession');
        if (!sessionDataString) {
            navigate('/join');
            return null;
        }
        return JSON.parse(sessionDataString).access_token;
    };
    
    // تابع برای دریافت تسک‌ها
    const fetchTasksByDate = async (date) => {
        const token = getAuthToken();
        if (!token) return;
        
        const dateStr = toYYYYMMDD(date);
        try {
            const response = await axios.get(`http://localhost:3001/api/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { date: dateStr }
            });
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    useEffect(() => {
        fetchTasksByDate(selectedDate);
  }, [selectedDate, fetchTasksByDate]); 

    // تابع برای اضافه کردن تسک
    const handleAddTask = async (newTaskData) => {
        const token = getAuthToken();
        if (!token) return;

        try {
            const response = await axios.post('http://localhost:3001/api/tasks', newTaskData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTasks(prevTasks => [...prevTasks, response.data]);
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Failed to add task.");
        }
    };

    // تابع برای تکمیل کردن تسک
    const handleCompleteTask = async (taskId) => {
        const token = getAuthToken();
        if (!token) return;

        try {
            const response = await axios.patch(`http://localhost:3001/api/tasks/${taskId}/complete`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTasks(tasks.map(t => t.id === taskId ? response.data : t));
        } catch (error) {
            console.error("Error completing task:", error);
        }
    };

    // تابع برای حذف تسک
    const handleDeleteTask = async (taskId) => {
        const token = getAuthToken();
        if (!token) return;

        try {
            await axios.delete(`http://localhost:3001/api/tasks/${taskId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const week = Array.from({ length: 7 }).map((_, i) => {
        const date = addDays(selectedDate, i - selectedDate.getDay());
        return { dayName: formatDate(date, { weekday: 'short' }), dayNumber: date.getDate(), fullDate: date };
    });

    return (
            <div className="calendar-content">
                <header className="calendar-header">
                    <div>
                        <p>{formatDate(selectedDate, { weekday: 'long' })}</p>
                        <h3>{formatDate(selectedDate, { month: 'long', day: 'numeric' })}</h3>
                    </div>
                    <button className="calendar-icon-button" onClick={() => dateInputRef.current?.showPicker()}>🗓️</button>
                    <input type="date" ref={dateInputRef} onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))} style={{ display: 'none' }} />
                </header>
                <div className="week-view-container">
                    {week.map((day, index) => (
                        <div key={index} className={`day-item ${day.dayNumber === selectedDate.getDate() ? 'active' : ''}`} onClick={() => setSelectedDate(day.fullDate)}>
                            <span className="day-name">{day.dayName}</span>
                            <span className="day-number">{day.dayNumber}</span>
                        </div>
                    ))}
                </div>
                <div className="calendar-task-list-container">
                    <div className="task-list-scrollable">
                        {tasks.length > 0 ? tasks.map(task => (
                            <CalendarTaskItem key={task.id} task={task} onComplete={handleCompleteTask} onDelete={handleDeleteTask} />
                         )) : <p className="empty-message">No tasks for this day.</p>}
                    </div>
                </div>
            <button className="fab" onClick={() => setIsModalOpen(true)}>+</button>
            {isModalOpen && <AddTaskModal onClose={() => setIsModalOpen(false)} onAddTask={handleAddTask} selectedDate={selectedDate} />}
            <Footer />
        </div>
    );
};

export default Calendar;
