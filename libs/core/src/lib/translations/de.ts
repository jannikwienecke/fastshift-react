import { operatorLabels } from '../filters';
import { en } from './en';
import { CommandHeader as commandHeaders } from '../types/commands';

const headers: {
  [key in commandHeaders]: string;
} = {
  view: 'Ansicht',
  admin: 'Admin',
  navigation: 'Navigation',
  'global-query': 'Suche nach "{{query}}"',
};

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

  __history: {
    changed: {
      'added-to': 'hinzugefügt zu',
      'removed-from': 'entfernt von',
      added: 'hinzugefügt',
      changed: 'geändert',
      created: 'erstellt',
      removed: 'entfernt',
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
    createNewIn: '{{name}} in {{field}} hinzufügen...',

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
    setValue: '{{field}} setzen',
    addMany: '{{field}} hinzufügen',
    openInNewTab: 'In neuem Tab öffnen',
    more: 'Mehr',
    overview: 'Übersicht',
    saveTo: 'Speichern in',
    to: 'zu',
    from: 'von',
    this: 'das',
  },

  userViewForm: {
    enterDescription: 'Beschreibung eingeben...',
    enterName: 'Name eingeben...',
  },

  datePicker: {
    description: 'Bitte wählen Sie ein Datum aus dem Kalender.',
  },
  richEditor: {
    placeholder: '{{name}} hinzufügen...',
  },

  rightSidebar: {
    noModelUser: '{{model}} nicht verwendet',
    see: '{{model}} ansehen',
    noResults: 'Keine Ergebnisse gefunden',
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
    deleteView: {
      title: 'Sind Sie sicher, dass Sie diese Ansicht löschen möchten?',
      description:
        'Wenn Sie diese Aktion rückgängig machen möchten, können Sie die Ansicht aus den Einstellungen wiederherstellen.',
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

  __commands: {
    createNewView: 'Neue Ansicht erstellen',
    saveView: 'Ansicht speichern',
    headers: headers,
    copyId: 'ID kopieren',
    copyUrl: 'URL kopieren',
    deleteModel: '{{name}} löschen',
    favoriteModel: '{{name}} favorisieren',
    unfavoriteModel: '{{name}} nicht mehr favorisieren',
    open: '{{name}} öffnen',
    goTo: 'Gehe zu {{name}}',
    remindMeLater: 'Erinnere mich später',
    delete: 'Löschen...',
    exportAsCsv: 'Als CSV exportieren',
  },
} satisfies typeof en;
