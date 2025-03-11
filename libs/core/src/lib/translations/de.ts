import { en } from './en';
export const de = {
  filter: {
    button: {
      label: 'Filter',
      placeholder: 'Filtern nach...',
    },
  },
  displayOptions: {
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
} satisfies typeof en;
