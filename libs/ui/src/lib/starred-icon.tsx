import { StarIcon } from 'lucide-react';
import { cn } from './utils';

export const StarredIcon = (props: {
  starred: boolean;
  onToggleFavorite?: () => void;
}) => {
  return (
    <StarIcon
      data-testid={props.starred ? 'starred' : 'unstarred'}
      className={cn(
        'h-4 w-4 cursor-pointer',
        props.starred ? 'text-yellow-500' : 'text-foreground'
      )}
      onClick={props.onToggleFavorite}
    />
  );
};
