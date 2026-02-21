// Employee data types
export interface Address {
  city: string;
  state: string;
  country: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  joinDate: string;
  isActive: boolean;
  skills: string[];
  address: Address;
  projects: number;
  lastReview: string;
  performanceRating: number;
}

// Filter types
export type FieldType = 'text' | 'number' | 'date' | 'amount' | 'singleSelect' | 'multiSelect' | 'boolean';

export type TextOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'notContains' | 'regex';
export type NumberOperator = 'equals' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'between';
export type DateOperator = 'equals' | 'before' | 'after' | 'between';
export type AmountOperator = 'equals' | 'between' | 'greaterThan' | 'lessThan';
export type SelectOperator = 'is' | 'isNot';
export type MultiSelectOperator = 'in' | 'notIn' | 'containsAll';
export type BooleanOperator = 'is';

export type Operator =
  | TextOperator
  | NumberOperator
  | DateOperator
  | AmountOperator
  | SelectOperator
  | MultiSelectOperator
  | BooleanOperator;

export interface FilterCondition {
  id: string;
  field: string;
  fieldType: FieldType;
  operator: Operator;
  value: any;
  nestedKey?: string; // For nested objects like address.city
  logicalOperator?: 'AND' | 'OR'; // For combining conditions
}

export interface FieldDefinition {
  key: keyof Employee | string;
  label: string;
  type: FieldType;
  operators: Operator[];
  options?: Array<{ label: string; value: any }>;
  nestedKey?: string; // For nested objects like address.city
}

export interface FilterState {
  conditions: FilterCondition[];
  logicalOperator: 'AND' | 'OR';
}

export interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  width?: string;
}
