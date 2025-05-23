import en from './en';

export const de = {
  welcome: {
    title: 'Willkommen bei FastApp',
    description: 'Verwalten Sie Ihre Aufgaben und Projekte effizient',
  },
  navigation: {
    projects: 'Projekte',
    tasks: 'Aufgaben',
    owner: 'Besitzer',
    logout: 'Abmelden',
    categories: 'Kategorien',
    tags: 'Tags',
    users: 'Benutzer',
    history: 'Verlauf',
  },
  projects: {
    one: 'Projekt',
    other: 'Projekte',
  },
  tags: {
    one: 'Tag',
    other: 'Tags',
  },
  tasks: {
    one: 'Aufgabe',
    other: 'Aufgaben',
    create: 'Aufgabe erstellen',
    delete: 'Aufgabe löschen',
  },
  name: {
    edit: 'Aufgabe umbenennen',
  },

  owner: {
    one: 'Besitzer',
    other: 'Besitzer',
  },

  firstname: {
    one: 'Vorname',
    other: 'Vorname',
  },
  lastname: {
    one: 'Nachname',
    other: 'Nachname',
  },

  priority: {
    one: 'Priorität',
    other: 'Prioritäten',
    none: 'Keine Priorität',
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
    urgent: 'Dringend',
  },

  categories: {
    one: 'Kategorie',
    other: 'Kategorien',
  },

  description: {
    one: 'Beschreibung',
    other: 'Beschreibungen',
    changeField: 'Beschreibung aktualisieren',
  },
  completed: {
    one: 'Erledigt',
    other: 'Erledigt',
    markAs: 'Als erledigt markieren ✅',
    unMarkAs: 'Als nicht erledigt markieren',
  },
  dueDate: {
    one: 'Fälligkeitsdatum',
    other: 'Fälligkeitsdaten',
  },
  todos: {
    one: 'Todo',
    other: 'Todos',
  },
  shared: {
    rename: '{{model}} umbenennen',
  },
  errors: {
    notFound: 'Nicht gefunden',
    unauthorized: 'Nicht autorisiert',
    minCharacters: 'Mindestens {{count}} Zeichen',
    invalidEmail: 'Ungültige E-Mail-Adresse',
  },
  commands: {
    resetDb: 'Datenbank zurücksetzen',
  },
  entityId: { one: 'ID', other: 'IDs' },
  tableName: { one: 'Tabelle', other: 'Tabellen' },

  history: {
    insert: 'Einfügen',
    update: 'Update',
    delete: 'Löschen',
    detail: { headerInsert: '', headerUpdate: '' },
  },
} satisfies typeof en;

export default de;
