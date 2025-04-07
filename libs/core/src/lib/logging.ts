import * as logging from 'loglevel';

const log = logging;

log.setDefaultLevel('debug');

export const llerror = log.error;
export const llwarn = log.warn;
export const llinfo = log.info;
export const lldebug = log.debug;
export const lltrace = log.trace;

export const logger = log.getLogger('app'); // Use a named logger

// Set the default log level (adjust based on environment)

const originalFactory = logger.methodFactory;
logger.methodFactory = (methodName, logLevel, loggerName) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return (...messages) => {
    rawMethod(
      `[${new Date()
        .toISOString()
        .slice(0, 16)}] [${methodName.toUpperCase()}]`,
      ...messages
    );
  };
};

// logger.methodFactory = (methodName, logLevel, loggerName) => {
//   return (...messages: unknown[]) => {
//     console[methodName](...messages);

//     try {
//       const existingLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
//       const newLogEntry = {
//         timestamp: new Date().toISOString(),
//         level: methodName.toUpperCase(),
//         messages,
//       };

//       localStorage.setItem(
//         'app_logs',
//         JSON.stringify([...existingLogs, newLogEntry])
//       );
//     } catch (error) {
//       console.error('Failed to save logs to localStorage', error);
//     }
//   };
// };

logger.setLevel(logger.getLevel()); // Apply new methodFactory

export const _log = logger;
