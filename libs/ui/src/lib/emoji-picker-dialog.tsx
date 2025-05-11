import { Emoji } from '@apps-next/core';
import {
  EmojiPicker,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './components';
import React from 'react';

export const EmojiPickerDialog = (props: {
  children?: React.ReactNode;
  onSelectEmoji: (emoji: Emoji) => void;
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSelectEmoji = (emoji: Emoji) => {
    props.onSelectEmoji(emoji);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <button
          data-testid="emoji-picker-button"
          aria-label="emoji-picker-button"
        >
          {props.children}
        </button>
      </PopoverTrigger>

      <PopoverContent
        onClick={(e) => e.stopPropagation()}
        className="w-fit p-0"
      >
        <EmojiPicker
          onSelectEmoji={(emoji) => {
            handleSelectEmoji(emoji);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
