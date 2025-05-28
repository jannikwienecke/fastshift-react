import { operatorLabels } from '../filters';
import { HistoryType } from '../types';
import { CommandHeader as commandHeaders } from '../types/commands';

export const headers: {
  [key in commandHeaders]: string;
} = {
  view: 'View',
  admin: 'Admin',
};

export const historyChangedTypes: {
  [key in HistoryType['changed']['type']]: string;
} = {
  added: 'added',
  'added-to': 'added',
  changed: 'changed',
  created: 'created',
  removed: 'removed',
  'removed-from': 'removed from',
};

export const en = {
  filter: {
    none: 'None',
    button: {
      label: 'FilterCool',
      placeholder: 'Filter by...',
    },
    operator: {
      [operatorLabels.IS]: 'Is',
      [operatorLabels.IS_NOT]: 'Is Not',
      [operatorLabels.CONTAINS]: 'Contains',
      [operatorLabels.DOES_NOT_CONTAIN]: 'Does Not Contain',
      [operatorLabels.IS_ANY_OF]: 'Is Any Of',
      [operatorLabels.IS_NOT_ANY_OF]: 'Is Not Any Of',
      [operatorLabels.BEFORE]: 'Before',
      [operatorLabels.AFTER]: 'After',
      [operatorLabels.WITHIN]: 'Within',
    },
  },

  commandform: {
    create: 'Create {{name}}',
    edit: 'Update {{name}}',
  },
  commandbar: {
    newLabel: 'New {{name}}',
    existingLabel: 'Existing {{name}}',
  },

  __commands: {
    createNewView: 'Create new view',
    saveView: 'Save view',
    headers: headers,
  },

  displayOptions: {
    button: {
      label: 'Display',
    },
    // Show empty groups
    listOptions: 'List Options',
    showEmptyGroups: 'Show empty groups',
    showDeleted: 'Show deleted',
    clearAll: 'Clear all',
    sorting: {
      label: 'Ordering',
      noSorting: 'No sorting',
    },
    grouping: {
      label: 'Grouping',
      noGrouping: 'No grouping',
    },
  },
  search: {
    placeholder: 'Search',
  },
  viewFields: {
    _creationTime: {
      label: 'Created At',
    },
  },
  common: {
    save: 'Save',
    reset: 'Reset',
    submit: 'Submit',
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete {{name}}',
    edit: 'Edit',
    editName: 'Edit {{name}}',
    saveField: 'Save {{name}}',
    change: 'Change',
    no: 'No',
    yes: 'Yes',
    none: 'No',
    createNew: 'Create new {{name}}',
    createNewIn: 'Create new {{name}} in {{field}}...',
    remove: 'Remove {{name}}',
    copy: 'Copy {{name}}',
    deleted: 'Deleted',
    changeField: 'Change {{field}}...',
    changeFieldTo: 'Change {{field}} to...',
    setField: 'Add to {{field}}...',
    addMany: 'Add {{field}}...',
    changeOrAdd: 'Change or add {{field}}...',
    setValue: 'Set {{field}}',
    // [TOGGLE_FIELD_LABEL]: TOGGLE_FIELD_LABEL,
    markAs: 'Mark as {{field}}',
    unmarkAs: 'Unmark as {{field}}',
    resetDb: 'Reset Database',
    openInNewTab: 'Open in new tab',
    saveTo: 'Save to',
    more: 'More',
    overview: 'Overview',
    to: 'to',
    from: 'from',
    this: 'this',
  },

  datePicker: {
    description: 'Please select a date from the calendar.',
  },

  richEditor: {
    placeholder: 'Add {{name}}...',
  },

  rightSidebar: {
    noModelUser: 'No {{model}} used',
    see: 'See {{model}}',
    noResults: 'Nothing found',
  },

  error: {
    title: '⚠️ ️️Oops! Something went wrong',
    showDetails: 'Show details',
    deleteRecord: 'Could not delete record. Please try again',
    updateRecord: 'Could not update record. Please try again',
  },
  success: {
    createRecord: {
      title: '✅ Created Successfully',
    },
  },

  copy: {
    id: 'Copy ID',
    url: 'Copy URL',
    json: 'Copy as JSON',
  },

  userViewForm: {
    enterName: 'Enter view name',
    enterDescription: 'Enter view description',
  },

  confirmationAlert: {
    title: 'Are you sure?',
    description: 'Are you sure you want to proceed?',
    delete: {
      title: 'Are you sure you want to delete this record?',
      description:
        'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
    },
  },

  __history: {
    changed: historyChangedTypes,
  },

  saveViewDropdown: {
    saveToThisView: 'Save to this view',
    createNewView: 'Create new view...',
  },
  _creationTime: {
    one: 'Created at',
    other: 'Created at',
  },
};
