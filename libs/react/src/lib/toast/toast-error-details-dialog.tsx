import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@apps-next/ui';
import { observer } from '@legendapp/state/react';
import { store$ } from '../legend-store';

export const ErrorDetailsDialog = observer(() => {
  const error = store$.errorDialog.error.get();

  if (!error) return null;

  const { message, status, context, error: errorMessage } = error;

  const formattedError = () => {
    try {
      // If the error is a JSON string, parse it for better display
      return typeof errorMessage === 'string' && errorMessage.startsWith('"')
        ? JSON.parse(
            errorMessage
              .replace(/^"/, '')
              .replace(/"$/, '')
              .replace(/\\"/g, '"')
          )
        : errorMessage;
    } catch (e) {
      return errorMessage;
    }
  };

  return (
    <Dialog
      open={!!error}
      onOpenChange={(open) => {
        if (!open) {
          store$.errorDialog.error.set(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-md lg:max-w-lg overflow-scroll">
        <DialogHeader>
          <DialogTitle>Error Details</DialogTitle>
          <DialogDescription>Status: {status}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 w-full">
          <div>
            <h3 className="font-medium">Message</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>

          <div>
            <h3 className="font-medium">Error</h3>
            <div className="bg-slate-100 p-2 rounded-md mt-1 overflow-auto max-h-40">
              <pre className="text-xs whitespace-pre-wrap">
                {typeof formattedError() === 'object'
                  ? JSON.stringify(formattedError(), null, 2)
                  : formattedError()}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Context</h3>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="text-sm">
                <span className="text-muted-foreground">Table:</span>{' '}
                {context.table}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">View:</span>{' '}
                {context.view}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Operation:</span>{' '}
                {context.type}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Display Field:</span>{' '}
                {context.displayField}
              </div>
            </div>
            <div className="mt-2">
              <h4 className="text-sm font-medium">Payload</h4>
              <div className="bg-slate-100 p-2 rounded-md mt-1 overflow-scroll max-h-40">
                <pre className="text-xs whitespace-pre-wrap wrap">
                  {JSON.stringify(context.payload, null, 2).replace(';', '; ')}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="w-full text-xs text-muted-foreground text-right">
            Error ID:{' '}
            {typeof context.payload === 'object' && 'id' in context.payload
              ? context.payload.id
              : 'N/A'}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
