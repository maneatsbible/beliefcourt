/**
 * Utility: in-browser structured logger (ported unchanged).
 */

const LEVELS = ['debug', 'info', 'warn', 'error'];
const MAX_ENTRIES = 200;

class Logger {
  constructor() {
    this._entries = [];
  }

  log(level, context, message, data) {
    if (!LEVELS.includes(level)) level = 'info';
    const entry = {
      ts:      new Date().toISOString(),
      level,
      context,
      message,
      data:    data !== undefined ? data : null,
    };
    this._entries.push(entry);
    if (this._entries.length > MAX_ENTRIES) this._entries.shift();
    const consoleFn = console[level] ?? console.log;
    consoleFn(`[${context}] ${message}`, ...(data !== undefined ? [data] : []));
  }

  debug(context, message, data) { this.log('debug', context, message, data); }
  info (context, message, data) { this.log('info',  context, message, data); }
  warn (context, message, data) { this.log('warn',  context, message, data); }
  error(context, message, data) { this.log('error', context, message, data); }

  getEntries() { return this._entries.slice(); }
  clear()      { this._entries = []; }
}

export const logger = new Logger();

if (typeof window !== 'undefined') {
  window.__dspLogger = logger;
}
