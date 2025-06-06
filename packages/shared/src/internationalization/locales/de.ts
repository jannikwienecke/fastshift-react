import { AllFieldsType, AllModelsType } from '@apps-next/core';
import en from './en';

const fieldTranslations: Partial<AllFieldsType> = {
  tableName: {
    one: 'Tabelle',
    other: 'Tabellen',
  },

  entityId: {
    one: 'Entity ID',
    other: 'Entity IDs',
  },

  dueDate: {
    one: 'Fälligkeitsdatum',
    other: 'Fälligkeitsdaten',
  },

  age: {
    one: 'Alter',
    other: 'Alter',
    edit: 'Alter bearbeiten',
    changeField: 'Alter aktualisieren',
  },
  color: {
    one: 'Farbe',
    other: 'Farben',
  },
  label: {
    one: 'Label',
    other: 'Labels',
  },
  name: {
    one: 'Name',
    other: 'Namen',
    edit: '{{model}} umbenennen',
    // changeField: 'Update description',
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
};

const modelTranslations: AllModelsType = {
  views: {
    one: 'Ansicht',
    other: 'Ansichten',
  },
  history: {
    one: 'Verlauf',
    other: 'Verlauf',
  },
  tasks_tags: {
    one: 'Aufgaben-Tag',
    other: 'Aufgaben-Tags',
  },
  users: {
    one: 'Benutzer',
    other: 'Benutzer',
    // edit: 'Edit User',
    // changeField: 'Update user',
  },
  projects: {
    one: 'Projekt',
    other: 'Projekte',
  },

  tags: {
    one: 'Tag',
    other: 'Tags',
  },
  categories: {
    one: 'Kategorie',
    other: 'Kategorien',
  },
  tasks: {
    one: 'Aufgabe',
    other: 'Aufgaben',
    create: 'Aufgabe erstellen',
    delete: 'Aufgabe löschen',
  },
  todos: {
    one: 'Todo',
    other: 'Todos',
  },

  owner: {
    one: 'Besitzer',
    other: 'Besitzer',
  },
};

export const de = {
  ...fieldTranslations,
  ...modelTranslations,
  welcome: {
    title: 'Willkommen bei FastApp',
    description: 'Verwalten Sie Ihre Aufgaben und Projekte effizient',
  },

  shared: {
    rename: '{{model}} umbenennen',
  },
  errors: {
    notFound: 'Nicht gefunden',
    unauthorized: 'Nicht autorisiert',
    minCharacters: 'Mindestens {{count}} Zeichen',
    invalidEmail: 'Ungültige E-Mail-Adresse',
    unknownError: 'Unbekannter Fehler',
  },
  commands: {
    resetDb: 'Datenbank zurücksetzen',
    makeACopy: 'Eine Kopie erstellen...',
    makeACopyOf: 'Eine Kopie als neues {{model}} erstellen...',
    toggleCompleteTask: 'Aufgabe als erledigt markieren',
    untoggleCompleteTask: 'Aufgabe als nicht erledigt markieren',
  },
  entityId: { one: 'ID', other: 'IDs' },
  tableName: { one: 'Tabelle', other: 'Tabellen' },

  history: {
    insert: 'Einfügen',
    update: 'Update',
    delete: 'Löschen',
    detail: { headerInsert: '', headerUpdate: '' },
  },

  users: { one: 'Benutzer', other: 'Benutzer' },
  color: { one: 'Farbe', other: 'Farben' },
  label: { one: 'Label', other: 'Labels' },
} satisfies typeof en;

export default de;
