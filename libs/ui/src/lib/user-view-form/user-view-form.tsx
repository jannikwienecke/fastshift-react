import { SaveViewDropdownProps } from '@apps-next/core';
import { InboxIcon, TerminalIcon } from 'lucide-react';
import { Button } from '../components';

export const UserViewForm = (props: SaveViewDropdownProps) => {
  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-4">
          <div className="bg-foreground/10 rounded-md h-7 w-7 grid place-items-center">
            <InboxIcon className="text-foreground/30 h-4" />
          </div>

          <div className="flex flex-col">
            <input
              placeholder="Enter View Name"
              className="text-[17px] h-8 placeholder:text-foreground/30 border-none shadow-none outline-none focus:ring-0"
              onChange={(e) => {
                const value = e.target.value;
                props.form?.onNameChange?.(value);
              }}
            />
          </div>
        </div>
        <div className="flex flex-row gap-2 text-xs items-center">
          <div>Save to </div>
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
              Cancel
            </Button>

            <Button
              onClick={props.form?.onSave}
              variant={'default'}
              className="h-7 px-2 text-xs font-normal"
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <div className="p-1 py-2 rounded-md h-7 w-7" />
        <input
          placeholder="Enter View Description"
          className="text-[13px]  h-8 placeholder:text-foreground/30 border-none shadow-none outline-none focus:ring-0"
          onChange={(e) => {
            const value = e.target.value;
            props.form?.onDescriptionChange?.(value);
          }}
        />
      </div>
    </div>
  );
};
