import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../Styles/Pages/CreateEvent.css';
const EditEvent = () => {
  const navigate = useNavigate();
  const {
    id
  } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    status: 'BUSY',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [original, setOriginal] = useState(null);
  useEffect(() => {
    fetchEvent();
  }, [id]);
  const fetchEvent = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch event');
      }
      const startDateTime = new Date(data.event.startTime);
      const endDateTime = new Date(data.event.endTime);
      const nextForm = {
        title: data.event.title || '',
        startDate: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endDate: endDateTime.toISOString().split('T')[0],
        endTime: endDateTime.toTimeString().slice(0, 5),
        status: data.event.status || 'BUSY',
        description: data.event.description || ''
      };
      setFormData(nextForm);
      setOriginal(nextForm);
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Failed to load event. Redirecting to dashboard...');
      navigate('/dashboard');
    } finally {
      setIsFetching(false);
    }
  };
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      if (endDateTime <= startDateTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const payload = {};
      if (original) {
        if (formData.title !== original.title) payload.title = formData.title;
        if (formData.status !== original.status) payload.status = formData.status;
        if (formData.description !== original.description) payload.description = formData.description;
        const origStartISO = new Date(`${original.startDate}T${original.startTime}`).toISOString();
        const origEndISO = new Date(`${original.endDate}T${original.endTime}`).toISOString();
        const newStartISO = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
        const newEndISO = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();
        if (newStartISO !== origStartISO) payload.startTime = newStartISO;
        if (newEndISO !== origEndISO) payload.endTime = newEndISO;
      }
      if (Object.keys(payload).length === 0) {
        navigate('/dashboard');
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update event');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating event:', error);
      setErrors({
        title: error.message || 'Failed to update event. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleCancel = () => {
    navigate('/dashboard');
  };
  const getEventDuration = () => {
    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      const diff = endDateTime - startDateTime;
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      }
    }
    return null;
  };
  const duration = getEventDuration();
  if (isFetching) {
    return <div className="create-event-container" style={{
      alignItems: 'center'
    }}>
                <div style={{
        textAlign: 'center',
        color: '#667eea'
      }}>
                    <div className="spinner" style={{
          width: '48px',
          height: '48px',
          margin: '0 auto 16px'
        }}></div>
                    <p>Loading event...</p>
                </div>
            </div>;
  }
  return <div className="create-event-container">
            <div className="create-event-wrapper">
                {}
                <div className="create-header">
                    <button className="back-btn" onClick={handleCancel}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="header-content">
                        <h1>Edit Event</h1>
                        <p>Update event details</p>
                    </div>
                </div>

                {}
                <form onSubmit={handleSubmit} className="create-event-form">
                    <div className="form-content">
                        {}
                        <div className="form-section">
                            <label htmlFor="title" className="section-label">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                Event Title *
                            </label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Team Meeting, Client Call, Workshop" className={errors.title ? 'error' : ''} maxLength={100} />
                            <div className="field-meta">
                                {errors.title && <span className="error-message">{errors.title}</span>}
                                <span className="char-count">{formData.title.length}/100</span>
                            </div>
                        </div>

                        {}
                        <div className="form-section">
                            <label className="section-label">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Date & Time *
                            </label>

                            <div className="datetime-grid">
                                {}
                                <div className="datetime-group">
                                    <label className="datetime-label">Start</label>
                                    <div className="datetime-inputs">
                                        <div className="input-group">
                                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={errors.startDate ? 'error' : ''} />
                                            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
                                        </div>
                                        <div className="input-group">
                                            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className={errors.startTime ? 'error' : ''} />
                                            {errors.startTime && <span className="error-message">{errors.startTime}</span>}
                                        </div>
                                    </div>
                                </div>

                                {}
                                {duration && <div className="duration-indicator">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                        <span>{duration}</span>
                                    </div>}

                                {}
                                <div className="datetime-group">
                                    <label className="datetime-label">End</label>
                                    <div className="datetime-inputs">
                                        <div className="input-group">
                                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className={errors.endDate ? 'error' : ''} />
                                            {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                                        </div>
                                        <div className="input-group">
                                            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className={errors.endTime ? 'error' : ''} />
                                            {errors.endTime && <span className="error-message">{errors.endTime}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="form-section">
                            <label className="section-label">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Event Status
                            </label>
                            <div className="status-options">
                                <label className={`status-option ${formData.status === 'BUSY' ? 'active busy' : ''}`}>
                                    <input type="radio" name="status" value="BUSY" checked={formData.status === 'BUSY'} onChange={handleChange} />
                                    <div className="status-content">
                                        <div className="status-icon busy">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div className="status-info">
                                            <span className="status-title">Busy</span>
                                            <span className="status-desc">Not available for swapping</span>
                                        </div>
                                    </div>
                                </label>

                                <label className={`status-option ${formData.status === 'SWAPPABLE' ? 'active swappable' : ''}`}>
                                    <input type="radio" name="status" value="SWAPPABLE" checked={formData.status === 'SWAPPABLE'} onChange={handleChange} />
                                    <div className="status-content">
                                        <div className="status-icon swappable">
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </div>
                                        <div className="status-info">
                                            <span className="status-title">Swappable</span>
                                            <span className="status-desc">Available for slot exchange</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {}
                        <div className="form-section">
                            <label htmlFor="description" className="section-label">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                Description (Optional)
                            </label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Add additional details about this event..." rows={4} maxLength={500} />
                            <div className="field-meta">
                                <span className="char-count">{formData.description.length}/500</span>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? <>
                                    <span className="spinner"></span>
                                    Updating...
                                </> : <>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Update Event
                                </>}
                        </button>
                    </div>
                </form>
            </div>
        </div>;
};
export default EditEvent;