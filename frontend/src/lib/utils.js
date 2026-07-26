export const PLAN_META = {
  free:  { label: 'Free',  price: 0,  instances: 1,         daily: 50,   accent: 'muted'  },
  pro:   { label: 'Pro',   price: 10, instances: 3,         daily: 300,  accent: 'accent' },
  ultra: { label: 'Ultra', price: 20, instances: Infinity,  daily: 1000, accent: 'purple' }
};

export const TRIAL_DAYS = 7;

export const WHATSAPP_CONTACT = '201002194451';

export function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_CONTACT}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function trialDaysLeft(user) {
  if (!user?.trialStartedAt) return 0;
  const ms = Date.now() - new Date(user.trialStartedAt).getTime();
  return Math.max(0, TRIAL_DAYS - Math.floor(ms / 86_400_000));
}

export function effectivePlan(user) {
  const p = user?.plan || 'free';
  if (p === 'pro' || p === 'ultra') return p;
  if (user?.trialStartedAt && trialDaysLeft(user) > 0) return 'pro';
  return 'free';
}

export function statusMeta(status) {
  switch (status) {
    case 'connected':   return { cls: 'badge-ok',   key: 's_connected' };
    case 'connecting':  return { cls: 'badge-warn', key: 's_connecting' };
    case 'qr_ready':    return { cls: 'badge-warn', key: 's_qr_ready' };
    case 'logged_out':  return { cls: 'badge-err',  key: 's_logged_out' };
    default:            return { cls: 'badge-muted',key: 's_disconnected' };
  }
}

export function modeMeta(mode) {
  switch (mode) {
    case 'fixed': return { key: 'modeFixed' };
    case 'qa':    return { key: 'modeQa' };
    case 'ai':
    case 'smart': return { key: 'modeAi' };
    default:      return { key: 'modeFixed' };
  }
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    return false;
  }
}

export function classnames(...xs) {
  return xs.filter(Boolean).join(' ');
}
