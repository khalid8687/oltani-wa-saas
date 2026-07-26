const isDev = import.meta.env.DEV;

export const logger = {
  info: (...args) => isDev && console.log('[OLTANI]', ...args),
  warn: (...args) => isDev && console.warn('[OLTANI]', ...args),
  error: (...args) => console.error('[OLTANI]', ...args)
};

export default logger;
