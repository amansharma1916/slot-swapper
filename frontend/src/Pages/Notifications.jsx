import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Pages/Notifications.css';
const Notifications = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('incoming');
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(null);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [inRes, outRes] = await Promise.all([fetch(`${import.meta.env.VITE_API_URL}/api/swap-requests/incoming`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }), fetch(`${import.meta.env.VITE_API_URL}/api/swap-requests/outgoing`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })]);
        const [inData, outData] = await Promise.all([inRes.json(), outRes.json()]);
        if (!inRes.ok) throw new Error(inData.message || 'Failed to load incoming');
        if (!outRes.ok) throw new Error(outData.message || 'Failed to load outgoing');
        setIncoming(inData.requests || []);
        setOutgoing(outData.requests || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [navigate]);
  const formatDateTime = date => new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const respond = async (requestId, accept) => {
    setActionBusy(requestId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/swap-response/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          accept
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      setIncoming(prev => prev.filter(r => r._id !== requestId));
      setOutgoing(prev => prev.map(r => r._id === requestId ? {
        ...r,
        status: accept ? 'ACCEPTED' : 'REJECTED'
      } : r));
      setToast({
        type: 'success',
        message: accept ? 'Swap accepted' : 'Swap rejected'
      });
      setTimeout(() => setToast(null), 2500);
    } catch (e) {
      console.error(e);
      setToast({
        type: 'error',
        message: e.message || 'Failed to perform action'
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setActionBusy(null);
    }
  };
  const renderRequest = (req, type) => {
    const requesterName = req?.requester?.fullName || 'User';
    const recipientName = req?.recipient?.fullName || 'You';
    const my = req.mySlot;
    const their = req.theirSlot;
    const created = new Date(req.createdAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    return <div key={req._id} className="notif-card">
                <div className="notif-main">
                    <div className="notif-title">
                        {type === 'incoming' ? <>
                                <strong>{requesterName}</strong> wants to swap
                            </> : <>
                                You proposed a swap to <strong>{recipientName}</strong>
                            </>}
                    </div>
                    <div className="notif-meta">Requested on {created} • Status: <span className={`status ${req.status?.toLowerCase()}`}>{req.status}</span></div>
                </div>
                <div className="notif-slots">
                    <div className="slot-chip">
                        <span className="chip-label">Their slot</span>
                        <div className="chip-title">{their?.title}</div>
                        <div className="chip-time">{formatDateTime(their?.startTime)} - {formatDateTime(their?.endTime)}</div>
                    </div>
                    <div className="swap-icon">⇄</div>
                    <div className="slot-chip">
                        <span className="chip-label">Your slot</span>
                        <div className="chip-title">{my?.title}</div>
                        <div className="chip-time">{formatDateTime(my?.startTime)} - {formatDateTime(my?.endTime)}</div>
                    </div>
                </div>
                {type === 'incoming' && req.status === 'PENDING' && <div className="notif-actions">
                        <button className="btn-secondary" disabled={actionBusy === req._id} onClick={() => respond(req._id, false)}>Reject</button>
                        <button className="btn-primary" disabled={actionBusy === req._id} onClick={() => respond(req._id, true)}>{actionBusy === req._id ? 'Processing…' : 'Accept'}</button>
                    </div>}
            </div>;
  };
  return <div className="notifications-container">
            <header className="notifications-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="header-content">
                    <h1>Notifications</h1>
                    <p>Manage your swap requests</p>
                </div>
            </header>

            <main className="notifications-main">
                {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
                <div className="tabs">
                    <button className={`tab ${tab === 'incoming' ? 'active' : ''}`} onClick={() => setTab('incoming')}>Incoming</button>
                    <button className={`tab ${tab === 'outgoing' ? 'active' : ''}`} onClick={() => setTab('outgoing')}>Sent</button>
                </div>

                {loading ? <div className="loading-state"><div className="spinner-large" /><p>Loading requests…</p></div> : tab === 'incoming' ? incoming.length === 0 ? <div className="empty-state">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            <h3>No incoming requests</h3>
                            <p>When someone proposes a swap, it will show up here.</p>
                        </div> : <div className="notif-list">
                            {incoming.map(req => renderRequest(req, 'incoming'))}
                        </div> : outgoing.length === 0 ? <div className="empty-state">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <h3>No sent requests</h3>
                            <p>Propose a swap from the Marketplace.</p>
                        </div> : <div className="notif-list">
                            {outgoing.map(req => renderRequest(req, 'outgoing'))}
                        </div>}
            </main>
        </div>;
};
export default Notifications;