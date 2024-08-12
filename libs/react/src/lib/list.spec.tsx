import { render } from '@testing-library/react';

import { List } from './list';

describe('ReactApp', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<List />);
    expect(baseElement).toBeTruthy();
  });

  it('should show the result of add(1, 2)', () => {
    const { getByText } = render(<List />);
    expect(getByText(/3/i)).toBeTruthy();
  });
});
