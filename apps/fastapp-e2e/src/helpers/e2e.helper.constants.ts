const PROJECT = {
  values: {
    firstListItem: 'Website Redesign',
    websiteRedesign: 'Website Redesign',
    fitnessPlan: 'Fitness Plan',
  },
};

const TAG = {
  values: {
    longTerm: 'Long-term',
    creative: 'Creative',
    planning: 'Planning',
  },
};

const PRIORITY = {
  values: {
    urgent: 'Urgent',
    none: 'None',
  },
  testId: {
    none: 'priority-none',
    urgent: 'priority-urgent',
  },
};

const TASK = {
  values: {
    firstListItem: 'Design mockups',
    designMockups: 'Design mockups',
    createWorkoutSchedule: 'Create workout schedule',
  },
};

const FILTER = {
  options: {
    name: 'name',
    project: 'project',
    completed: 'completed',
    tag: 'tag',
    priority: 'priority',
    date: 'due date',
  },
};
const OWNER = {
  values: {
    johnDoe: 'John Doe',
    janeSmith: 'Jane Smith',
  },
};

const CATEGORY = {
  values: {
    work: 'Work',
    personal: 'Personal',
  },
};

const DUEDATE = {
  values: {
    today: 'Today',
    tomorrow: 'Tomorrow',
  },
};
const USER = {
  values: {
    johnDoe: 'john.doe@example.com',
    janeSmith: 'jane.smith@example.com',
  },
};

export const CON = {
  project: PROJECT,
  tag: TAG,
  priority: PRIORITY,
  task: TASK,
  owner: OWNER,
  category: CATEGORY,
  filter: FILTER,
  dueDate: DUEDATE,
  user: USER,
};
