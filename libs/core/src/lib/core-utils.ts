export const invarant = (condition: boolean, message: string) => {
  const prefix = 'Invariant failed';

  if (condition) {
    return;
  }

  const label = message ? `${prefix}: ${message}` : prefix;
  throw new Error(label);
};

export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
