import * as logging from 'loglevel';

const log = logging;

log.setDefaultLevel('debug');

export const llerror = log.error;
export const llwarn = log.warn;
export const llinfo = log.info;
export const lldebug = log.debug;
export const lltrace = log.trace;
