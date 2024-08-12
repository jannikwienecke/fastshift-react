import { api } from './index';

describe('convex', () => {
  it('should work', () => {
    expect(api.query.create).toBeDefined();
  });
});
