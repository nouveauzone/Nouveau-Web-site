import React, { useState, useEffect } from 'react';
import { BUSINESS_UPI_ID, isValidUpiId } from '../config/payment';

// ============================================================
// NOUVEAUZ — UPI Intent Payment
// PhonePe / GPay / Paytm button click → seedha app open
// Works best on mobile (desktop users can copy the UPI ID)
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

  // Dynamic QR Code generation using upiqr.com (FREE & RELIABLE)
  const qrImageSrc = `https://upiqr.in/api/qr?name=${encodeURIComponent(merchantLabel)}&vpa=${normalizedUpiId}&amount=${formattedAmount}&note=${encodeURIComponent(txnNote)}`;
  const fallbackQrImage = '/upi-qr.png'; // User's static QR

  const [qrLoaded, setQrLoaded] = useState(false);

  const handleAppClick = (app) => {
    if (!upiIdValid) {
      alert('Configured UPI ID is invalid. Please contact support.');
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
      setUtrError('Please enter a valid 12-digit UTR/Reference number.');
      return;
    }

    setShowConfirm(false);
    setUtrError('');
    if (onSuccess) onSuccess({ method: activeApp, upiId: normalizedUpiId, amount, orderId, reference: normalizedUtr, note: txnNote, merchantName: merchantLabel });
    if (onPending) onPending({ method: activeApp, status: 'pending_verification', reference: normalizedUtr, note: txnNote });
  };

  const styles = {
    wrapper: {
      fontFamily: "'Poppins', sans-serif",
    },
    heading: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color: '#C9A227', // GOLD
      marginBottom: 20,
      textAlign: 'center',
    },
    appsGrid: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      marginBottom: 24,
    },
    appIcon: (app, active) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      opacity: active ? 1 : 0.8,
      transform: active ? 'scale(1.1)' : 'scale(1)',
      transition: 'all 0.2s',
    }),
    qrCard: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '24px 20px',
      borderRadius: 18,
      border: '1.5px solid #C9A22730',
      background: '#fff',
      boxShadow: '0 8px 30px rgba(201,162,39,0.06)',
      margin: '0 auto 24px',
      maxWidth: '300px',
    },
    qrTitle: {
      fontSize: 13,
      fontWeight: 600,
      color: '#1a1a1a',
      margin: 0,
    },
    qrImage: {
      width: '180px',
      height: '180px',
      borderRadius: 12,
      border: '1px solid #eee',
      background: '#fff',
      padding: 10,
    },
    upiIdBox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: 12,
      padding: '10px 14px',
      maxWidth: '280px',
      margin: '0 auto 20px',
    },
    copyBtn: {
      background: '#1a1a1a',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      padding: '6px 12px',
      fontSize: 11,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    toast: {
      position: 'absolute',
      top: -40,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#2ecc71',
      color: '#fff',
      padding: '6px 14px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(46,204,113,0.3)',
      whiteSpace: 'nowrap',
    },
    amountBox: {
      textAlign: 'center',
      padding: '16px 0',
      borderTop: '1px dashed #e0e0e0',
      marginTop: 8,
    }
  };

  return (
    <div style={styles.wrapper}>
      <p style={styles.heading}>Secure UPI Checkout</p>

      {/* UPI Apps for Mobile */}
      {isMobile && (
        <div style={styles.appsGrid}>
          {UPI_APPS.map((app) => (
            <button
              key={app.id}
              style={styles.appIcon(app, activeApp === app.id)}
              onClick={() => handleAppClick(app)}
            >
              {app.icon}
              <span style={{ fontSize: 10, fontWeight: 600, color: '#666' }}>{app.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* QR Code Section - Premium Design */}
      <div style={styles.qrCard}>
        <p style={styles.qrTitle}>Scan & Pay via UPI</p>
        <div style={{ position: 'relative' }}>
          <img
            src={qrImageSrc}
            alt="Scan to Pay"
            style={styles.qrImage}
            onLoad={() => setQrLoaded(true)}
            onError={(e) => { e.target.src = fallbackQrImage; }}
          />
          {!qrLoaded && (
            <div style={{ position: 'absolute', inset: 0, background: '#f5f5f5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#aaa' }}>
              Generating QR...
            </div>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 11, color: '#666', textAlign: 'center', lineHeight: 1.6 }}>
          Use any UPI app like GPay, PhonePe or Paytm to scan and pay <strong>₹{Number(amount).toLocaleString('en-IN')}</strong>
        </p>
      </div>

      {/* UPI ID Display with Copy Button & Toast */}
      <div style={{ position: 'relative' }}>
        {copied && <div style={styles.toast}>✓ UPI ID Copied!</div>}
        <div style={styles.upiIdBox}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
            <p style={{ margin: 0, fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase' }}>Merchant UPI ID</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis' }}>{normalizedUpiId}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(normalizedUpiId);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{ ...styles.copyBtn, background: copied ? '#2ecc71' : '#1a1a1a' }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div style={styles.amountBox}>
        <p style={{ margin: 0, fontSize: 12, color: '#888' }}>Total Payable Amount</p>
        <p style={{ margin: '2px 0 0', fontSize: 28, fontWeight: 800, color: '#1a1a1a' }}>
          ₹{Number(amount).toLocaleString('en-IN')}
        </p>
      </div>

      {showConfirm && (
        <div style={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
          <div style={styles.confirmSheet} onClick={(event) => event.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Did you complete the payment?</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#666' }}>
              ₹{Number(amount).toLocaleString('en-IN')} via {UPI_APPS.find((app) => app.id === activeApp)?.name}
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
              Not yet, try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectUPIPayment;