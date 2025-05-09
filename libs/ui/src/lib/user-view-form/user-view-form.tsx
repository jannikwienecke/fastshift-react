import { SaveViewDropdownProps, useTranslation } from '@apps-next/core';
import { InboxIcon, TerminalIcon } from 'lucide-react';
import { Button } from '../components';
import { EmojiPickerDialog } from '../emoji-picker-dialog';

export const UserViewForm = (props: SaveViewDropdownProps) => {
  const { t } = useTranslation();
  const viewName = props.form?.viewName;

  return (
    <div className="">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-4 flex-grow">
          <EmojiPickerDialog
            onSelectEmoji={(emoji) => {
              props.form?.onEmojiChange?.(emoji);
            }}
          >
            <button className="bg-foreground/10 rounded-md h-7 w-7 grid place-items-center">
              {props.form?.emoji ? (
                props.form.emoji.emoji
              ) : (
                <InboxIcon className="text-foreground/30 h-4" />
              )}
            </button>
          </EmojiPickerDialog>

          <div className="flex flex-col w-full">
            <input
              placeholder={t('userViewForm.enterName')}
              className="text-[17px] h-8 w-full placeholder:text-foreground/30 border-none shadow-none outline-none focus:ring-0"
              defaultValue={props.form?.viewName ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                props.form?.onNameChange?.(value);
              }}
            />
          </div>
        </div>

        <div className="flex flex-row gap-2 text-xs items-center">
          <div>{t('common.saveTo')}</div>
          <div className="flex flex-row gap-1 items-center border p-1 border-foreground/10 rounded-md">
            <div className="bg-yellow-600 py-[1px] px-0 rounded-sm">
              <TerminalIcon className="h-[10px] text-white w-4" />
            </div>
            <div className="text-[11px]">Dev</div>
          </div>

          <div className="flex flex-row">
            <Button
              onClick={props.form?.onCancel}
              variant={'ghost'}
              className="h-7 px-2 text-xs font-light"
            >
              {t('common.cancel')}
            </Button>

            <Button
              disabled={!viewName || viewName.length < 2}
              onClick={props.form?.onSave}
              variant={'default'}
              className="h-7 px-2 text-xs font-normal"
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <div className="p-1 py-2 rounded-md h-7 w-7" />
        <input
          placeholder={t('userViewForm.enterDescription')}
          className="text-[13px] w-full  h-8 placeholder:text-foreground/30 border-none shadow-none outline-none focus:ring-0"
          defaultValue={props.form?.viewDescription ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            props.form?.onDescriptionChange?.(value);
          }}
        />
      </div>
    </div>
  );
};
