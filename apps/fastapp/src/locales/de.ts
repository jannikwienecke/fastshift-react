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
  project: {
    one: 'Projekt',
    other: 'Projekte',
  },
  task: {
    one: 'Aufgabe',
    other: 'Aufgaben',
    create: 'Aufgabe erstellen',
    edit: 'Aufgabe bearbeiten',
    delete: 'Aufgabe löschen',
  },
  priority: {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
  },
} satisfies typeof en;
