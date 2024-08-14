import { render } from '@testing-library/react';
import { ViewProvider } from '../view-provider';
import { List } from './list';

describe('ReactApp', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ViewProvider
        viewConfigManager={{
          getTableName: () => 'users',
          getDisplayFieldLabel: () => 'users',
          getViewFieldList: () => [],
          getSearchableField: () => undefined,
          viewConfig: {} as any,
        }}
      >
        <List />
      </ViewProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
