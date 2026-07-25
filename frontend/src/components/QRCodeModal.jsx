import React, { useEffect, useState } from 'react';
import { getSocket } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { X, QrCode, CheckCircle, RefreshCw } from 'lucide-react';

export default function QRCodeModal({ instanceId, initialQr, onClose, onConnected }) {
  const { t } = useLanguage();
  const [qrCode, setQrCode] = useState(initialQr || null);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const socket = getSocket();
    socket.emit('join_instance', instanceId);

    const handleQrUpdate = (data) => {
      if (data.instanceId === instanceId && data.qr) {
        setQrCode(data.qr);
        setStatus('qr_ready');
      }
    };

    const handleStatusChange = (data) => {
      if (data.instanceId === instanceId) {
        setStatus(data.status);
        if (data.status === 'connected') {
          if (onConnected) onConnected();
        }
      }
    };

    socket.on('qr_code', handleQrUpdate);
    socket.on('status_change', handleStatusChange);

    return () => {
      socket.off('qr_code', handleQrUpdate);
      socket.off('status_change', handleStatusChange);
      socket.emit('leave_instance', instanceId);
    };
  }, [instanceId, onConnected]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '420px', padding: '2rem', textAlign: 'center', position: 'relative' }}>
        
        {/* Close button */}
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '50%', color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
          <QrCode size={32} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{t('scanQR')}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          افتح تطبيق الواتساب على هاتفك &gt; الأجهزة المرتبطة &gt; ربط جهاز، وسلّط الكاميرا على الرمز التالي:
        </p>

        {/* QR Render or Status */}
        {status === 'connected' ? (
          <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-green)' }}>
            <CheckCircle size={56} />
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>تم ربط رقم الواتساب بنجاح!</span>
          </div>
        ) : qrCode ? (
          <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '16px', display: 'inline-block', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <img src={qrCode} alt="WhatsApp QR Code" style={{ width: '220px', height: '220px' }} />
          </div>
        ) : (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={36} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
            <span>جاري التجهيز وتوليد رمز الـ QR...</span>
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={onClose} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
}
