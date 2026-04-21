import React, { useState, useEffect } from 'react';
import { BUSINESS_UPI_ID, isValidUpiId } from '../config/payment';

// ============================================================
// NOUVEAUZ — UPI Intent Payment
// PhonePe / GPay / Paytm button click → seedha app open
// Mobile par kaam karta hai (desktop par UPI ID copy hoti hai)
// ============================================================

const UPI_APPS = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    color: '#5f259f',
    textColor: '#fff',
    intentScheme: (upiId, amount, txnNote) =>
      `phonepe://pay?pa=${upiId}&pn=Nouveauz&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`,
    upiUrl: (upiId, amount, txnNote) =>
      `upi://pay?pa=${upiId}&pn=Nouveauz&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}&mc=5699`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#5f259f" />
        <text x="20" y="27" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">Pe</text>
      </svg>
    ),
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    color: '#fff',
    textColor: '#3c4043',
    intentScheme: (upiId, amount, txnNote) =>
      `tez://upi/pay?pa=${upiId}&pn=Nouveauz&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`,
    upiUrl: (upiId, amount, txnNote) =>
      `upi://pay?pa=${upiId}&pn=Nouveauz&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40">
        <rect width="40" height="40" rx="8" fill="white" stroke="#e0e0e0" />
        <text x="20" y="27" textAnchor="middle" fill="#4285F4" fontSize="14" fontWeight="bold">GPay</text>
      </svg>
    ),
  },
  {
    id: 'paytm',
    name: 'Paytm',
    color: '#00b9f1',
    textColor: '#fff',
    intentScheme: (upiId, amount, txnNote) =>
      `paytmmp://pay?pa=${upiId}&pn=Nouveauz&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`,
    upiUrl: (upiId, amount, txnNote) =>
      `upi://pay?pa=${upiId}&pn=Nouveauz&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40">
        <rect width="40" height="40" rx="8" fill="#00b9f1" />
        <text x="20" y="27" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Paytm</text>
      </svg>
    ),
  },
  {
    id: 'bhim',
    name: 'BHIM',
    color: '#00529b',
    textColor: '#fff',
    intentScheme: (upiId, amount, txnNote) =>
      `upi://pay?pa=${upiId}&pn=Nouveauz&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`,
    upiUrl: (upiId, amount, txnNote) =>
      `upi://pay?pa=${upiId}&pn=Nouveauz&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`,
    icon: (
      <svg width="28" height="28" viewBox="0 0 40 40">
        <rect width="40" height="40" rx="8" fill="#00529b" />
        <text x="20" y="27" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">BHIM</text>
      </svg>
    ),
  },
];

const DirectUPIPayment = ({
  amount,
  orderId,
  upiId = BUSINESS_UPI_ID,
  merchantName = 'Nouveauz',
  onSuccess,
  onPending,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const txnNote = `Nouveauz Order ${orderId || Date.now()}`;
  const merchantLabel = merchantName || 'Nouveauz';
  const formattedAmount = Number(amount).toFixed(2);
  const normalizedUpiId = String(upiId || '').trim().toLowerCase();
  const upiIdValid = isValidUpiId(normalizedUpiId);

  const handleAppClick = (app) => {
    if (!upiIdValid) {
      alert('UPI ID invalid hai. Please admin se valid UPI ID update karwaein.');
      return;
    }

    setActiveApp(app.id);

    if (isMobile) {
      const intentUrl = app.intentScheme(normalizedUpiId, formattedAmount, txnNote);

      window.location.href = intentUrl;

      setTimeout(() => {
        setShowConfirm(true);
      }, 4000);
    } else {
      navigator.clipboard?.writeText(normalizedUpiId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  const handlePaymentDone = () => {
    const normalizedUtr = String(utrNumber || '').replace(/\D/g, '');
    if (!/^\d{12}$/.test(normalizedUtr)) {
      setUtrError('Valid 12-digit UTR/Ref no. enter karo.');
      return;
    }

    setShowConfirm(false);
    setUtrError('');
    if (onSuccess) onSuccess({ method: activeApp, upiId: normalizedUpiId, amount, orderId, reference: normalizedUtr, note: txnNote, merchantName: merchantLabel });
    if (onPending) onPending({ method: activeApp, status: 'pending_verification', reference: normalizedUtr, note: txnNote });
  };

  const styles = {
    wrapper: {
      fontFamily: "'Segoe UI', Arial, sans-serif",
    },
    heading: {
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#888',
      marginBottom: 14,
    },
    appsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 16,
    },
    appBtn: (app, active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      background: active ? '#f0f0f0' : app.color,
      color: app.textColor,
      border: app.color === '#fff' ? '1.5px solid #e0e0e0' : 'none',
      borderRadius: 10,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 600,
      transition: 'transform 0.1s, opacity 0.1s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }),
    upiIdBox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#f5f5f5',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      padding: '12px 16px',
      marginBottom: 14,
    },
    confirmOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 9999,
    },
    confirmSheet: {
      background: '#fff',
      borderRadius: '20px 20px 0 0',
      padding: '28px 24px 40px',
      width: '100%',
      maxWidth: 480,
      textAlign: 'center',
    },
    confirmBtn: {
      width: '100%',
      padding: '15px',
      background: '#1a1a1a',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      marginBottom: 10,
    },
    cancelBtn: {
      width: '100%',
      padding: '13px',
      background: 'none',
      color: '#666',
      border: '1px solid #ddd',
      borderRadius: 10,
      fontSize: 14,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.wrapper}>
      <p style={styles.heading}>Pay with UPI</p>

      <div style={styles.appsGrid}>
        {UPI_APPS.map((app) => (
          <button
            key={app.id}
            style={styles.appBtn(app, activeApp === app.id)}
            onClick={() => handleAppClick(app)}
            onMouseDown={(event) => { event.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={(event) => { event.currentTarget.style.transform = 'scale(1)'; }}
          >
            {app.icon}
            <span>{app.name}</span>
          </button>
        ))}
      </div>

      {!isMobile && (
        <div style={styles.upiIdBox}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: '#aaa', letterSpacing: '0.05em' }}>UPI ID</p>
            <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 600, color: upiIdValid ? '#1a1a1a' : '#d32f2f' }}>{normalizedUpiId || 'Not configured'}</p>
          </div>
          <button
            onClick={() => { navigator.clipboard?.writeText(normalizedUpiId); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            disabled={!upiIdValid}
            style={{ padding: '8px 16px', background: copied ? '#3B6D11' : '#1a1a1a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', transition: 'background 0.2s' }}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {!upiIdValid && (
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#d32f2f', textAlign: 'center' }}>
          Invalid UPI ID configured. Add valid REACT_APP_UPI_ID in frontend env.
        </p>
      )}

      {isMobile && (
        <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', margin: '4px 0 12px' }}>
          Button dabao → App seedha khulegi → Pay karo
        </p>
      )}

      <div style={{ textAlign: 'center', padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>Amount</p>
        <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
          ₹{Number(amount).toLocaleString('en-IN')}
        </p>
      </div>

      {showConfirm && (
        <div style={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
          <div style={styles.confirmSheet} onClick={(event) => event.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Payment ho gaya?</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#666' }}>
              ₹{Number(amount).toLocaleString('en-IN')} {UPI_APPS.find((app) => app.id === activeApp)?.name} se
            </p>
            <div style={{ marginBottom: 12, textAlign: 'left' }}>
              <label htmlFor="upi-utr" style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#666' }}>
                UTR / Ref No (12 digits)
              </label>
              <input
                id="upi-utr"
                type="text"
                value={utrNumber}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, '').slice(0, 12);
                  setUtrNumber(value);
                  if (utrError) setUtrError('');
                }}
                inputMode="numeric"
                placeholder="e.g. 123456789012"
                style={{
                  width: '100%',
                  border: `1.5px solid ${utrError ? '#d32f2f' : '#ddd'}`,
                  borderRadius: 10,
                  padding: '12px 13px',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {utrError && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#d32f2f' }}>{utrError}</p>}
            </div>
            <button style={styles.confirmBtn} onClick={handlePaymentDone}>
              Submit for Verification
            </button>
            <button style={styles.cancelBtn} onClick={() => setShowConfirm(false)}>
              Nahi, dobara try karo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectUPIPayment;