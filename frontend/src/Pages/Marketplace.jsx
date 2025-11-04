import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Pages/Marketplace.css';
const Marketplace = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [mySwappable, setMySwappable] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);
  const [selectedMySlotId, setSelectedMySlotId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    const fetchSlots = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/swappable-slots`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load swappable slots');
        const formatted = data.events.map(e => ({
          ...e,
          startTime: new Date(e.startTime),
          endTime: new Date(e.endTime)
        }));
        setSlots(formatted);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchMyEvents = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load my events');
        const swappable = (data.events || []).filter(e => e.status === 'SWAPPABLE');
        setMySwappable(swappable);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSlots();
    fetchMyEvents();
  }, [navigate]);
  const formatDateTime = date => new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const getDuration = (s, e) => {
    const diff = new Date(e) - new Date(s);
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
    return `${h}h ${m}m`;
  };
  const openSwapModal = slot => {
    setSelectedTheirSlot(slot);
    setSelectedMySlotId(mySwappable[0]?._id || '');
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedTheirSlot(null);
    setSelectedMySlotId('');
  };
  const submitSwap = async () => {
    if (!selectedMySlotId || !selectedTheirSlot?._id) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/swap-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mySlotId: selectedMySlotId,
          theirSlotId: selectedTheirSlot._id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create swap request');
      setSlots(prev => prev.filter(s => s._id !== selectedTheirSlot._id));
      setToast({
        type: 'success',
        message: 'Swap request sent!'
      });
      setTimeout(() => setToast(null), 2500);
      closeModal();
    } catch (e) {
      console.error(e);
      setToast({
        type: 'error',
        message: e.message || 'Failed to request swap'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="marketplace-container">
            <header className="marketplace-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="header-content">
                    <h1>Marketplace</h1>
                    <p>Browse swappable slots from other users</p>
                </div>
            </header>

            <main className="marketplace-main">
                {toast && <div className={`toast ${toast.type}`} role="status" aria-live="polite">{toast.message}</div>}
                {isLoading ? <div className="loading-state">
                        <div className="spinner-large" />
                        <p>Loading swappable slots...</p>
                    </div> : slots.length === 0 ? <div className="empty-state">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <h3>No swappable slots yet</h3>
                        <p>Check back later to find an available slot</p>
                    </div> : <div className="slots-grid">
                        {slots.map(slot => <div key={slot._id} className="slot-card">
                                <div className="slot-header">
                                    <h4>{slot.title}</h4>
                                    <span className="badge">Swappable</span>
                                </div>
                                <div className="slot-details">
                                    <div className="slot-time">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>{formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}</span>
                                    </div>
                                    <div className="slot-duration">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        <span>{getDuration(slot.startTime, slot.endTime)}</span>
                                    </div>
                                </div>
                                <div className="slot-actions">
                                    <button className="request-btn" onClick={() => openSwapModal(slot)} disabled={mySwappable.length === 0} title={mySwappable.length === 0 ? 'You have no swappable slots' : 'Propose a swap'}>
                                        Request Swap
                                    </button>
                                </div>
                            </div>)}
                    </div>}
            </main>

            {modalOpen && <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Propose Swap</h3>
                            <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-section">
                                <label>Desired slot</label>
                                <div className="modal-chip">
                                    <strong>{selectedTheirSlot?.title}</strong>
                                    <span>{formatDateTime(selectedTheirSlot?.startTime)} - {formatDateTime(selectedTheirSlot?.endTime)}</span>
                                </div>
                            </div>
                            <div className="modal-section">
                                <label>Your swappable slot</label>
                                {mySwappable.length === 0 ? <p className="muted">You don't have any SWAPPABLE slots. Set one of your events to SWAPPABLE from the Dashboard.</p> : <select value={selectedMySlotId} onChange={e => setSelectedMySlotId(e.target.value)}>
                                        {mySwappable.map(e => <option key={e._id} value={e._id}>
                                                {e.title} — {formatDateTime(e.startTime)} - {formatDateTime(e.endTime)}
                                            </option>)}
                                    </select>}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={closeModal}>Cancel</button>
                            <button className="btn-primary" onClick={submitSwap} disabled={!selectedMySlotId || submitting}>
                                {submitting ? 'Sending…' : 'Send Request'}
                            </button>
                        </div>
                    </div>
                </div>}
        </div>;
};
export default Marketplace;