import en from './en';

export default {
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

  tasks: {
    one: 'Aufgabe',
    other: 'Aufgaben',
    create: 'Aufgabe erstellen',
    edit: 'Aufgabe bearbeiten',
    delete: 'Aufgabe löschen',
  },
  priority: {
    one: 'Priorität',
    other: 'Prioritäten',
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
  },
  completed: {
    one: 'Erledigt',
    other: 'Erledigt',
  },
  description: {
    one: 'Beschreibung',
    other: 'Beschreibungen',
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
  },
} satisfies typeof en;
