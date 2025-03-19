import { operatorLabels } from '../filters';

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
    submit: 'Submit',
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete {{name}}',
    edit: 'Edit',
    change: 'Change',
    no: 'No',
    yes: 'Yes',
    none: 'No',
    createNew: 'Create new {{name}}',
    copy: 'Copy {{name}}',
    deleted: 'Deleted',
    changeField: 'Change {{field}}...',
    setField: 'Add to {{field}}...',
    changeOrAdd: 'Change or add {{field}}...',
  },

  error: {
    title: '⚠️ ️️Oops! Something went wrong',
    showDetails: 'Show details',
    deleteRecord: 'Could not delete entry. Please try again',
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
};
