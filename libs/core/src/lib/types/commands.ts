export type CommandName =
  | 'create-new-view'
  | 'save-view'
  | 'open-view-form'
  | 'update-model-record'
  | 'delete-model-attribute'
  | 'update-model-attribute'
  | 'select-model-attribute'
  | 'select-model-relational-option'
  | 'user-store-command'
  | 'copy-model'
  | 'model-commands'
  | 'goTo-commands'
  | 'open-commands'
  | 'global-query-commands'
  | 'navigation-commands';

export type CommandHeader =
  | 'view'
  | 'admin'
  | 'navigation'
  | (string & {
      //
    });
