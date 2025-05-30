import * as React from 'react';
import { SearchIcon } from 'lucide-react';
import { cn } from '../utils';
import { Input, InputProps } from './input';

export interface SearchInputProps extends InputProps {
  /**
   * Custom search icon component
   */
  searchIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /**
   * Position of the search icon
   */
  iconPosition?: 'left' | 'right';
  /**
   * Additional className for the search icon
   */
  iconClassName?: string;
  /**
   * Additional className for the wrapper container
   */
  wrapperClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      searchIcon: SearchIconComponent = SearchIcon,
      iconPosition = 'left',
      iconClassName,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('relative', wrapperClassName)}>
        {iconPosition === 'left' && (
          <SearchIconComponent
            className={cn(
              'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
              iconClassName
            )}
          />
        )}

        <Input
          ref={ref}
          className={cn(iconPosition === 'left' ? 'pl-9' : 'pr-9', className)}
          {...props}
        />

        {iconPosition === 'right' && (
          <SearchIconComponent
            className={cn(
              'absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
              iconClassName
            )}
          />
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
