import { ChevronDownIcon, LayersIcon, FolderPlusIcon } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '../components';
import { SaveViewDropdownProps, useTranslation } from '@apps-next/core';

export function SaveViewDropdown(props: SaveViewDropdownProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-7 px-2 flex flex-row text-xs gap-1"
          variant="outline"
        >
          <div>{t('common.save')}</div>
          <div>
            <ChevronDownIcon className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-52 mr-4">
        <DropdownMenuGroup>
          <DropdownMenuItem
            role="button"
            className="flex flex-row gap-3"
            onClick={props.onSave}
          >
            <LayersIcon className="h-3 w-3" />
            {t('saveViewDropdown.saveToThisView')}
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            role="button"
            className="flex flex-row gap-3"
            onClick={props.onSaveAsNewView}
          >
            <FolderPlusIcon className="h-3 w-3" />
            {t('saveViewDropdown.createNewView')}
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
