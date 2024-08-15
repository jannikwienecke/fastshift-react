import * as logging from 'loglevel';

const log = logging;

log.setDefaultLevel('warn');

export const error = log.error;
export const warn = log.warn;
export const info = log.info;
export const debug = log.debug;
export const trace = log.trace;
