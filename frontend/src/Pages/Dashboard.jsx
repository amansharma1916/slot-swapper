import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Pages/Dashboard.css';
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [calendarDate, setCalendarDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userData));
    fetchEvents();
  }, [navigate]);
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch events');
      }
      const formattedEvents = data.events.map(event => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime)
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };
  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }
      setEvents(events.map(event => event._id === eventId ? {
        ...event,
        status: newStatus
      } : event));
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update event status');
    }
  };
  const handleDeleteEvent = async eventId => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete event');
      }
      setEvents(events.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(error.message || 'Failed to delete event');
    }
  };
  const handleEditEvent = eventId => {
    navigate(`/edit-event/${eventId}`);
  };
  const getStatusColor = status => {
    switch (status) {
      case 'BUSY':
        return '#ef4444';
      case 'SWAPPABLE':
        return '#10b981';
      case 'SWAP_PENDING':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };
  const formatDateTime = date => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getEventDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  const startOfMonth = date => new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = date => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startOfWeek = date => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const formatYMD = date => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const monthStart = startOfMonth(calendarDate);
  const monthEnd = endOfMonth(calendarDate);
  const gridStart = startOfWeek(monthStart);
  const totalCells = 42;
  const daysGrid = Array.from({
    length: totalCells
  }, (_, i) => addDays(gridStart, i));
  const eventsByDay = events.reduce((acc, ev) => {
    const dayKey = formatYMD(new Date(ev.startTime));
    (acc[dayKey] = acc[dayKey] || []).push(ev);
    return acc;
  }, {});
  return <div className="dashboard-container">
            {}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="brand">
                        <h1>Slot Swapper</h1>
                    </div>
                    <nav className="nav-menu">
                        <button className="nav-link active">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </button>
                        <button className="nav-link" onClick={() => navigate('/marketplace')}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Marketplace
                        </button>
                        <button className="nav-link" onClick={() => navigate('/notifications')}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Notifications
                        </button>
                    </nav>
                    <div className="user-section">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                                <span className="user-name">{user?.fullName}</span>
                                <span className="user-email">{user?.email}</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {}
            <main className="dashboard-main">
                <div className="dashboard-content">
                    {}
                    <div className="page-header">
                        <div>
                            <h2>My Events</h2>
                            <p>Manage your schedule and swap slots with others</p>
                        </div>
                        <div className="header-actions">
                            <div className="view-toggle">
                                <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    List
                                </button>
                                <button className={viewMode === 'calendar' ? 'active' : ''} onClick={() => setViewMode('calendar')}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Calendar
                                </button>
                            </div>
                            <button className="create-btn" onClick={() => navigate('/create-event')}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Event
                            </button>
                        </div>
                    </div>

                    {}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{
              background: '#eff6ff'
            }}>
                                <svg style={{
                color: '#3b82f6'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>{events.length}</h3>
                                <p>Total Events</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{
              background: '#f0fdf4'
            }}>
                                <svg style={{
                color: '#10b981'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>{events.filter(e => e.status === 'SWAPPABLE').length}</h3>
                                <p>Swappable</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{
              background: '#fef3c7'
            }}>
                                <svg style={{
                color: '#f59e0b'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>{events.filter(e => e.status === 'SWAP_PENDING').length}</h3>
                                <p>Pending Swaps</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{
              background: '#fee2e2'
            }}>
                                <svg style={{
                color: '#ef4444'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="stat-info">
                                <h3>{events.filter(e => e.status === 'BUSY').length}</h3>
                                <p>Busy</p>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="events-section">
                        {isLoading ? <div className="loading-state">
                                <div className="spinner-large"></div>
                                <p>Loading events...</p>
                            </div> : viewMode === 'calendar' ? <div className="calendar-wrapper">
                                <div className="calendar-header-row">
                                    <button className="cal-nav" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}>
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <h3 className="cal-title">{calendarDate.toLocaleString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}</h3>
                                    <button className="cal-nav" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}>
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                                <div className="calendar-grid cal-weekdays">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="cal-weekday">{d}</div>)}
                                </div>
                                <div className="calendar-grid">
                                    {daysGrid.map((day, idx) => {
                const key = formatYMD(day);
                const inMonth = day.getMonth() === calendarDate.getMonth();
                const isToday = formatYMD(day) === formatYMD(new Date());
                const dayEvents = (eventsByDay[key] || []).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                return <div key={idx} className={`day-cell ${inMonth ? '' : 'muted'} ${isToday ? 'today' : ''}`}>
                                                <div className="day-head">
                                                    <span className="day-num">{day.getDate()}</span>
                                                </div>
                                                <div className="day-events">
                                                    {dayEvents.length === 0 ? <div className="no-events">—</div> : dayEvents.map(ev => <button key={ev._id} className={`cal-event status-${ev.status.toLowerCase()}`} title={`${ev.title}\n${formatDateTime(ev.startTime)} - ${formatDateTime(ev.endTime)}`} onClick={() => handleEditEvent(ev._id)}>
                                                            <span className="cal-event-time">{new Date(ev.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                                                            <span className="cal-event-title">{ev.title}</span>
                                                        </button>)}
                                                </div>
                                            </div>;
              })}
                                </div>
                            </div> : events.length === 0 ? <div className="empty-state">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3>No events yet</h3>
                                <p>Create your first event to get started</p>
                                <button className="create-btn" onClick={() => navigate('/create-event')}>
                                    Create Event
                                </button>
                            </div> : <div className="events-list">
                                {events.map(event => <div key={event._id} className="event-card">
                                        <div className="event-header">
                                            <div className="event-title-section">
                                                <h4>{event.title}</h4>
                                                <span className="status-badge" style={{
                    backgroundColor: getStatusColor(event.status) + '20',
                    color: getStatusColor(event.status)
                  }}>
                                                    {event.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="event-actions">
                                                <button className="icon-btn" title="Edit" onClick={() => handleEditEvent(event._id)}>
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button className="icon-btn delete" title="Delete" onClick={() => handleDeleteEvent(event._id)}>
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="event-details">
                                            <div className="event-time">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{formatDateTime(event.startTime)} - {formatDateTime(event.endTime)}</span>
                                            </div>
                                            <div className="event-duration">
                                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <span>{getEventDuration(event.startTime, event.endTime)}</span>
                                            </div>
                                        </div>
                                        <div className="event-footer">
                                            {event.status === 'BUSY' && <button className="status-btn swappable" onClick={() => handleStatusChange(event._id, 'SWAPPABLE')}>
                                                    Make Swappable
                                                </button>}
                                            {event.status === 'SWAPPABLE' && <button className="status-btn busy" onClick={() => handleStatusChange(event._id, 'BUSY')}>
                                                    Mark as Busy
                                                </button>}
                                            {event.status === 'SWAP_PENDING' && <button className="status-btn pending" disabled>
                                                    Swap Request Pending
                                                </button>}
                                        </div>
                                    </div>)}
                            </div>}
                    </div>
                </div>
            </main>

            {}
            {showCreateModal && <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create New Event</h3>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{
            textAlign: 'center',
            color: '#6b7280'
          }}>Event creation form coming soon...</p>
                        </div>
                    </div>
                </div>}
        </div>;
};
export default Dashboard;