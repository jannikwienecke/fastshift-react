import { Emoji } from '@apps-next/core';
import { EmojiPicker as EmojiPickerFrimousse } from 'frimousse';

export const EmojiPicker = (props: {
  onSelectEmoji: (emoji: Emoji) => void;
}) => {
  return (
    <EmojiPickerFrimousse.Root
      onEmojiSelect={(emoji) => {
        props.onSelectEmoji(emoji);
      }}
      className="isolate flex h-[368px] w-fit flex-col bg-white dark:bg-neutral-900"
    >
      <EmojiPickerFrimousse.Search className="z-10 mx-2 mt-2 appearance-none rounded-md bg-neutral-100 px-2.5 py-2 text-sm dark:bg-neutral-800" />
      <EmojiPickerFrimousse.Viewport className="relative flex-1 outline-hidden">
        <EmojiPickerFrimousse.Loading className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
          Loading…
        </EmojiPickerFrimousse.Loading>
        <EmojiPickerFrimousse.Empty className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
          No emoji found.
        </EmojiPickerFrimousse.Empty>
        <EmojiPickerFrimousse.List
          className="select-none pb-1.5"
          components={{
            CategoryHeader: ({ category, ...props }) => (
              <div
                className="bg-white px-3 pt-3 pb-1.5 font-medium text-neutral-600 text-xs dark:bg-neutral-900 dark:text-neutral-400"
                {...props}
              >
                {category.label}
              </div>
            ),
            Row: ({ children, ...props }) => {
              return (
                <div className="scroll-my-1.5 px-1.5" {...props}>
                  {children}
                </div>
              );
            },
            Emoji: ({ emoji, ...props }) => {
              return (
                <button
                  className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-neutral-100 dark:data-[active]:bg-neutral-800"
                  {...props}
                >
                  {emoji.emoji}
                </button>
              );
            },
          }}
        />
      </EmojiPickerFrimousse.Viewport>
    </EmojiPickerFrimousse.Root>
  );
};
