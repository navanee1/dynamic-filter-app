import type { FieldDefinition } from '../types';

export const fieldDefinitions: FieldDefinition[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    operators: ['equals', 'contains', 'startsWith', 'endsWith', 'notContains', 'regex']
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    operators: ['equals', 'contains', 'endsWith', 'regex']
  },
  {
    key: 'department',
    label: 'Department',
    type: 'singleSelect',
    operators: ['is', 'isNot'],
    options: [
      { label: 'Engineering', value: 'Engineering' },
      { label: 'Product', value: 'Product' },
      { label: 'Sales', value: 'Sales' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'Design', value: 'Design' },
      { label: 'Finance', value: 'Finance' },
      { label: 'HR', value: 'HR' },
      { label: 'Operations', value: 'Operations' },
      { label: 'Legal', value: 'Legal' }
    ]
  },
  {
    key: 'role',
    label: 'Role',
    type: 'text',
    operators: ['equals', 'contains']
  },
  {
    key: 'salary',
    label: 'Salary',
    type: 'amount',
    operators: ['equals', 'between', 'greaterThan', 'lessThan']
  },
  {
    key: 'joinDate',
    label: 'Join Date',
    type: 'date',
    operators: ['equals', 'before', 'after', 'between']
  },
  {
    key: 'isActive',
    label: 'Active Status',
    type: 'boolean',
    operators: ['is']
  },
  {
    key: 'skills',
    label: 'Skills',
    type: 'multiSelect',
    operators: ['in', 'notIn', 'containsAll'],
    options: [
      { label: 'React', value: 'React' },
      { label: 'TypeScript', value: 'TypeScript' },
      { label: 'Node.js', value: 'Node.js' },
      { label: 'Python', value: 'Python' },
      { label: 'GraphQL', value: 'GraphQL' },
      { label: 'PostgreSQL', value: 'PostgreSQL' },
      { label: 'AWS', value: 'AWS' },
      { label: 'Docker', value: 'Docker' },
      { label: 'Kubernetes', value: 'Kubernetes' },
      { label: 'Vue.js', value: 'Vue.js' },
      { label: 'Angular', value: 'Angular' },
      { label: 'Java', value: 'Java' },
      { label: 'Go', value: 'Go' },
      { label: 'Scala', value: 'Scala' },
      { label: 'Machine Learning', value: 'Machine Learning' }
    ]
  },
  {
    key: 'address.city',
    label: 'City',
    type: 'text',
    operators: ['equals', 'contains'],
    nestedKey: 'address.city'
  },
  {
    key: 'address.state',
    label: 'State',
    type: 'singleSelect',
    operators: ['is', 'isNot'],
    options: [
      { label: 'CA', value: 'CA' },
      { label: 'NY', value: 'NY' },
      { label: 'TX', value: 'TX' },
      { label: 'WA', value: 'WA' },
      { label: 'MA', value: 'MA' },
      { label: 'OR', value: 'OR' },
      { label: 'CO', value: 'CO' },
      { label: 'FL', value: 'FL' },
      { label: 'IL', value: 'IL' },
      { label: 'GA', value: 'GA' },
      { label: 'AZ', value: 'AZ' },
      { label: 'DC', value: 'DC' },
      { label: 'NV', value: 'NV' },
      { label: 'NC', value: 'NC' }
    ]
  },
  {
    key: 'projects',
    label: 'Number of Projects',
    type: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual', 'between']
  },
  {
    key: 'lastReview',
    label: 'Last Review Date',
    type: 'date',
    operators: ['equals', 'before', 'after', 'between']
  },
  {
    key: 'performanceRating',
    label: 'Performance Rating',
    type: 'number',
    operators: ['equals', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual', 'between']
  }
];

export const getFieldDefinition = (fieldKey: string): FieldDefinition | undefined => {
  return fieldDefinitions.find(f => f.key === fieldKey);
};

export const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};

export const setNestedValue = (obj: any, path: string, value: any): void => {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
};
