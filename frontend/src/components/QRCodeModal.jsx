import React, { useEffect, useState, useRef } from 'react';
import { connectSocket } from '../services/api.js';
import { useLang } from '../contexts/LanguageContext.jsx';
import { X, CheckCircle2, Loader2, QrCode } from 'lucide-react';

export default function QRCodeModal({ instanceId, initialQr, onClose, onConnected }) {
  const { t } = useLang();
  const [qr, setQr] = useState(initialQr || null);
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(null);

  // Store callbacks in refs so the effect runs once per instanceId.
  const onCloseRef = useRef(onClose);
  const onConnectedRef = useRef(onConnected);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onConnectedRef.current = onConnected; }, [onConnected]);

  useEffect(() => {
    let socket;
    let mounted = true;

    (async () => {
      try {
        socket = await connectSocket();
        socket.emit('instance:subscribe', instanceId);

        const onPatch = (data) => {
          if (!mounted || data?.instanceId !== instanceId) return;
          if (data.qrCode) setQr(data.qrCode);
          if (data.status) setStatus(data.status);
          if (data.status === 'connected' && onConnectedRef.current) onConnectedRef.current();
        };
        const onInstanceError = (data) => {
          if (data?.instanceId !== instanceId) return;
          if (data.error === 'forbidden') setError('Not authorized to view this instance.');
          else if (data.error === 'server_error') setError('Server error. Try again.');
        };
        socket.on('instance:patch', onPatch);
        socket.on('instance:error', onInstanceError);
      } catch (err) {
        if (mounted) setError(err?.message?.includes('auth') ? 'Authentication required.' : 'Connection failed.');
      }
    })();

    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      mounted = false;
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (socket) {
        try {
          socket.emit('instance:unsubscribe', instanceId);
          socket.off('instance:patch');
        } catch (err) {
          console.warn('[QRCodeModal] cleanup:', err.message);
        }
      }
    };
  }, [instanceId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="surface max-w-sm w-full p-6 text-center relative">
        <button onClick={onClose} className="absolute top-3 end-3 p-1.5 text-muted hover:text-fg rounded-md hover:bg-subtle">
          <X size={18} />
        </button>

        <div className="inline-flex p-2.5 rounded-xl bg-accent/10 text-accent mb-3">
          <QrCode size={24} />
        </div>

        <h2 className="text-lg font-bold mb-1">{t('qrTitle')}</h2>
        <p className="text-xs text-muted mb-5 leading-relaxed">{t('qrHelp')}</p>

        {error ? (
          <div className="py-6 flex flex-col items-center gap-3 text-err">
            <span className="text-sm">{error}</span>
            <button onClick={() => onCloseRef.current?.()} className="btn-secondary">{t('cancel')}</button>
          </div>
        ) : status === 'connected' ? (
          <div className="py-6 flex flex-col items-center gap-3 text-ok">
            <CheckCircle2 size={56} />
            <span className="font-semibold">{t('qrConnected')}</span>
          </div>
        ) : qr ? (
          <div className="inline-block p-3 bg-white rounded-xl shadow-card">
            <img src={qr} alt="QR" className="w-52 h-52" />
          </div>
        ) : (
          <div className="py-10 flex flex-col items-center gap-3 text-muted">
            <Loader2 size={36} className="animate-spin" />
            <span className="text-sm">{t('qrGenerating')}</span>
          </div>
        )}

        <button onClick={onClose} className="btn-secondary w-full mt-5">{t('cancel')}</button>
      </div>
    </div>
  );
}
