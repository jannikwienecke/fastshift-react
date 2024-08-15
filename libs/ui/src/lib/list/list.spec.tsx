import { render } from '@testing-library/react';
import { List } from './list';

describe('ReactApp', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<List items={[{ name: 'test' }]} />);
    expect(baseElement).toBeTruthy();
  });
});
