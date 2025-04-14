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
  commandform: {
    create: '{{name}} erstellen',
    edit: '{{name}} aktualisieren',
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
    submit: 'Absenden',
    confirm: 'Bestätigen',
    cancel: 'Abbrechen',
    delete: '{{name}} löschen',
    edit: 'Bearbeiten',
    editName: '{{name}} bearbeiten',
    saveField: '{{name}} speichern',
    change: 'Ändern',
    no: 'Nein',
    yes: 'Ja',
    none: 'Kein',
    createNew: '{{name}} hinzufügen',
    remove: '{{name}} entfernen',
    copy: '{{name}} kopieren',
    deleted: 'Gelöscht',
    changeField: 'Ändern {{field}}...',
    changeFieldTo: '{{field}} ändern...',
    setField: '{{field}} hinzufügen...',
    changeOrAdd: 'Ändern oder hinzufügen {{field}}...',
    markAs: 'Als {{field}} markieren',
    unmarkAs: 'Als nicht {{field}} markieren',
    resetDb: 'Datenbank zurücksetzen',
    reset: 'Zurücksetzen',
  },
  datePicker: {
    description: 'Bitte wählen Sie ein Datum aus dem Kalender.',
  },
  richEditor: {
    placeholder: '{{name}} hinzufügen...',
  },
  error: {
    title: '⚠️ ️️Oops! Etwas ist schiefgelaufen',
    showDetails: 'Details anzeigen',
    deleteRecord:
      'Eintrag konnte nicht gelöscht werden. Bitte versuchen Sie es erneut',
    updateRecord:
      'Eintrag konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut',
  },
  success: {
    createRecord: {
      title: '✅ Erfolgreich erstellt',
    },
  },

  copy: {
    id: 'ID kopieren',
    url: 'URL kopieren',
    json: 'Als JSON kopieren',
  },

  commandbar: {
    existingLabel: 'Zugewiesene {{name}}',
    newLabel: 'Neue {{name}}',
  },
  confirmationAlert: {
    title: 'Sind Sie sicher?',
    description: 'Sind Sie sicher, dass Sie fortfahren möchten?',
    delete: {
      title: 'Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?',
      description:
        'Diese Aktion kann nicht rückgängig gemacht werden. Dies wird Ihr Konto dauerhaft löschen und Ihre Daten von unseren Servern entfernen.',
    },
  },
  saveViewDropdown: {
    saveToThisView: 'In diese Ansicht speichern',
    createNewView: 'Neue Ansicht erstellen...',
  },
  _creationTime: {
    one: 'Created at',
    other: 'Created at',
  },
} satisfies typeof en;
