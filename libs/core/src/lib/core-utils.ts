import invariantTiny from 'tiny-invariant';

export const invarant = (condition: boolean, message: string) => {
  // if (process.env['NODE_ENV'] === 'development') {
  //   console.error('Invariant failed', message);
  // }

  invariantTiny(condition, message);
};
