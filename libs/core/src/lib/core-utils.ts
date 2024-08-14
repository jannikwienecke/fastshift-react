export const invarant = (condition: boolean, message: string) => {
  // if (process.env['NODE_ENV'] === 'development') {
  //   console.error('Invariant failed', message);
  // }

  const prefix = 'Invariant failed';

  if (condition) {
    return;
  }

  const label = message ? `${prefix}: ${message}` : prefix;
  throw new Error(label);
};
