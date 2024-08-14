import { invarant } from './core-utils';

describe('core-utils', () => {
  it('should work', () => {
    expect(invarant(true, 'test')).toBeUndefined();
  });
});
