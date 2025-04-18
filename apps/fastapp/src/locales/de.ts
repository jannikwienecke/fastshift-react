import en from './en';

export const de = {
  welcome: {
    title: 'Willkommen bei FastApp',
    description: 'Verwalten Sie Ihre Aufgaben und Projekte effizient',
  },
  navigation: {
    projects: 'Projekte',
    tasks: 'Aufgaben',
    settings: 'Einstellungen',
    logout: 'Abmelden',
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
  priority: {
    one: 'Priorität',
    other: 'Prioritäten',
    none: 'Keine Priorität',
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
    urgent: 'Dringend',
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
  },
  commands: {
    resetDb: 'Datenbank zurücksetzen',
  },
} satisfies typeof en;

export default de;
