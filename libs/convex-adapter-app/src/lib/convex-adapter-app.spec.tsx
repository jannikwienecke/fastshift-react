import { render } from '@testing-library/react';

import ConvexAdapterApp from './convex-adapter-app';

describe('ConvexAdapterApp', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ConvexAdapterApp />);
    expect(baseElement).toBeTruthy();
  });
});
