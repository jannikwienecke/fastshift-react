import { CommandbarItem, Row } from '@apps-next/core';
import { DownloadIcon, Layers3Icon, PencilIcon, TrashIcon } from 'lucide-react';
import { currentView$, store$, userView$ } from '../legend-store';
import { getViewName } from './commands.helper';
import { observable } from '@legendapp/state';

const isViewCommands = () => store$.commandsDialog.type.get() === 'view';

const downloadingCSVInProgress = observable(false);

const downloadCsv = async (rows: Row[]) => {
  console.debug('download csv...', { rowCount: rows.length });

  // Reset the progress flag immediately to prevent multiple calls
  downloadingCSVInProgress.set(false);

  if (!rows || rows.length === 0) {
    console.warn('No data to download');
    return;
  }

  try {
    const data = rows.map((r) => r.raw);

    // Escape CSV values properly
    const escapeCSVValue = (value: unknown): string => {
      const str = String(value ?? '');
      // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      Object.keys(data[0]).map(escapeCSVValue).join(','), // header row
      ...data.map((row) => Object.values(row).map(escapeCSVValue).join(',')), // data rows
    ].join('\n');

    // Create a unique filename each time
    const timestamp = Date.now();
    const viewName = currentView$.viewName.get() || 'export';
    const filename = `${viewName}_${timestamp}.csv`;

    console.debug('Creating download with filename:', filename);

    // Try modern File System Access API first (works better for multiple downloads)
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'CSV files',
              accept: {
                'text/csv': ['.csv'],
              },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write('\uFEFF' + csvContent); // Add BOM
        await writable.close();

        console.debug(
          'Download completed using File System Access API:',
          filename
        );
        return;
      } catch (err: unknown) {
        // Check if user cancelled the dialog
        if (
          err instanceof Error &&
          (err.name === 'AbortError' || err.message?.includes('aborted'))
        ) {
          console.debug('User cancelled the save dialog');
          return; // Exit without fallback download
        }

        // API not supported or other error, fall back to blob download
        console.debug(
          'File System Access API failed, falling back to blob download:',
          err instanceof Error ? err.message : String(err)
        );
      }
    }

    // Fallback to blob download with user interaction simulation
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);

    // Create link with event listener approach to ensure user interaction
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    link.style.position = 'fixed';
    link.style.left = '-9999px';

    // Add click event listener to ensure proper event handling
    link.addEventListener('click', (e) => {
      console.debug('Link click event triggered for:', filename);
      // Don't prevent default - let the download proceed
    });

    document.body.appendChild(link);

    // Force focus and trigger click with proper user interaction context
    link.focus();

    // Use both click() and dispatchEvent for better compatibility
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    const success = link.dispatchEvent(clickEvent);
    console.debug('Click event dispatched:', success, 'for file:', filename);

    // Also try the direct click method
    link.click();

    // Clean up after a longer delay to ensure download starts
    setTimeout(() => {
      try {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
        console.debug('Download cleanup completed for:', filename);
      } catch (e) {
        console.debug('Cleanup warning:', e);
      }
    }, 1000);

    console.debug('Download initiated successfully');
  } catch (error) {
    console.error('Download failed:', error);
  }
};

const hasEventListenerForRows = observable(false);
const addEventListenerForRows = () => {
  store$.dataModel.rows.onChange(() => {
    if (!downloadingCSVInProgress.get()) return;

    // Only download if we have data and are still in progress
    const rows = store$.dataModel.rows.get();

    if (rows && rows.length > 0) {
      downloadCsv(rows);
    }

    downloadingCSVInProgress.set(false); // Reset the flag after download
  });
};

export const makeViewCommands = () => {
  if (!hasEventListenerForRows.get()) {
    hasEventListenerForRows.set(true);
    addEventListenerForRows();
  }

  const editViewCommand: CommandbarItem = {
    id: 'edit-view',
    label: 'common.edit',
    header: 'view',
    command: 'view-commands',
    getViewName,
    getIsVisible: () => isViewCommands() && !!userView$.get(),
    icon: PencilIcon,
    handler: () => {
      console.log('UPDATE..');
      console.debug('viewCommand - handler');

      const userView = userView$.get();
      store$.userViewSettings.form.set({
        type: 'edit',

        viewName: userView?.name ?? '',
        viewDescription: userView?.description ?? '',
        emoji: userView?.emoji ?? undefined,
      });
    },
  };

  const deleteViewCommand: CommandbarItem = {
    id: 'delete-view',
    label: '__commands.delete',
    header: 'view',
    command: 'view-commands',
    getViewName,
    getIsVisible: () => isViewCommands() && !!userView$.get(),
    icon: TrashIcon,
    handler: () => {
      console.log('DELETE..');
      console.debug('viewCommand - delete view');

      const userView = userView$.get();

      const baseView = userView?.baseView;

      if (baseView && userView) {
        store$.confirmationAlert.open.set(true);
        store$.confirmationAlert.title.set(
          'confirmationAlert.deleteView.title'
        );
        store$.confirmationAlert.description.set(
          'confirmationAlert.deleteView.description'
        );

        store$.confirmationAlert.onConfirm.set({
          cb: () => {
            store$.navigation.state.set({ type: 'navigate', view: baseView });

            store$.updateViewMutation({
              id: userView?.id ?? '',
              deleted_: true,
            });
          },
        });
      }
    },
  };

  const viewCommand: CommandbarItem = {
    id: 'create-new-view',
    label: '__commands.createNewView',
    header: 'view',
    command: 'view-commands',
    getViewName,
    getIsVisible: isViewCommands,
    icon: Layers3Icon,
    handler: () => {
      console.debug('viewCommand - handler - create new view');
      store$.userViewSettings.form.set({
        type: 'create',
        viewName: '',
        viewDescription: '',
        emoji: undefined,
      });
    },
  };

  const exportAsCsv: CommandbarItem = {
    id: 'export-as-csv',
    label: '__commands.exportAsCsv',
    header: 'view',
    command: 'view-commands',
    getViewName,
    getIsVisible: isViewCommands,
    icon: DownloadIcon,
    handler: () => {
      console.debug('viewCommand - handler - create new view');

      if (store$.fetchMore.isDone.get()) {
        console.debug('DONE FETCHING ALL');
        downloadCsv(store$.dataModel.rows.get());
      } else {
        downloadingCSVInProgress.set(true);
        store$.isFetchAll.set(true);
      }
    },
  };

  return [
    editViewCommand,
    deleteViewCommand,
    viewCommand,
    exportAsCsv,
  ] satisfies CommandbarItem[];
};
