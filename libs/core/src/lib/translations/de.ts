import { operatorLabels } from '../filters';
import { en } from './en';
export const de = {
  filter: {
    none: 'Keine',
    button: {
      label: 'Filter',
      placeholder: 'Filtern nach...',
    },
    operator: {
      [operatorLabels.IS]: 'Ist',
      [operatorLabels.IS_NOT]: 'Ist Nicht',
      [operatorLabels.CONTAINS]: 'Enthält',
      [operatorLabels.DOES_NOT_CONTAIN]: 'Enthält Nicht',
      [operatorLabels.IS_ANY_OF]: 'ist eine/r von',
      [operatorLabels.IS_NOT_ANY_OF]: 'Ist Nicht Einer Von',
      [operatorLabels.BEFORE]: 'Vor',
      [operatorLabels.AFTER]: 'Nach',
      [operatorLabels.WITHIN]: 'Innerhalb',
    },
  },
  displayOptions: {
    showDeleted: 'Gelöschte anzeigen',
    clearAll: 'Zurücksetzen',
    sorting: {
      label: 'Sortierung',
      noSorting: 'Keine Sortierung',
    },
    grouping: {
      label: 'Gruppierung',
      noGrouping: 'Keine Gruppierung',
    },
    listOptions: 'Optionen',
    showEmptyGroups: 'Leere Gruppen anzeigen',
    button: {
      label: 'Anzeige',
    },
  },
  search: {
    placeholder: 'Suchen',
  },

  viewFields: {
    _creationTime: {
      label: 'Erstellt am',
    },
  },
  common: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: '{{name}} löschen',
    edit: 'Bearbeiten',
    change: 'Ändern',
    none: 'Kein',
    yes: 'Ja',
    no: 'Nein',
    createNew: 'Neues {{name}}',
    copy: 'Kopieren',
    deleted: 'Gelöscht',
  },

  error: {
    title: '⚠️ ️️Oops! Etwas ist schiefgelaufen',
    showDetails: 'Details anzeigen',
    deleteRecord:
      'Eintrag konnte nicht gelöscht werden. Bitte versuchen Sie es erneut',
  },
} satisfies typeof en;
