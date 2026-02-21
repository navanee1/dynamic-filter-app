import type { FilterCondition } from '../types';
import { fieldDefinitions } from '../data/fieldDefinitions';

export interface ValidationError {
  field?: string;
  operator?: string;
  value?: string;
  general?: string;
}

export class FilterValidator {
  /**
   * Validate a filter condition
   * 
   * A valid filter needs:
   * 1. A field selected (e.g., "name", "salary")
   * 2. An operator chosen (e.g., "contains", "greater than")
   * 3. A value provided that makes sense for that field type
   * 
   * Returns an error object if anything is wrong, or null if everything is valid.
   */
  static validateCondition(condition: FilterCondition): ValidationError | null {
    // Step 1: Check if field is selected
    if (!condition.field) {
      return { field: 'Please select a field' };
    }

    // Step 2: Check if operator is selected
    if (!condition.operator) {
      return { operator: 'Please select an operator' };
    }

    // Step 3: Get field definition to check valid operators
    const fieldDef = fieldDefinitions.find(f => f.key === condition.field);
    if (!fieldDef) {
      return { field: 'Invalid field selected' };
    }

    // Step 4: Make sure the chosen operator is valid for this field type
    // Example: "contains" operator doesn't work for number fields
    if (!fieldDef.operators.includes(condition.operator)) {
      return { operator: 'Invalid operator for this field type' };
    }

    // Step 5: Validate the actual value (e.g., make sure numbers are valid, dates are valid, etc.)
    return this.validateValue(condition.fieldType, condition.operator, condition.value);
  }

  /**
   * Validate condition value based on field type
   * 
   * Different field types have different validation rules:
   * - Text fields: just need non-empty string
   * - Numbers: must be valid numbers
   * - Dates: must be valid date format
   * - Booleans: always valid (can't be empty)
   * - etc.
   */
  private static validateValue(fieldType: string, operator: string, value: any): ValidationError | null {
    // Most fields require a value, but "is" operator (for boolean) doesn't need a value
    if (!value && operator !== 'is') {
      if (fieldType === 'multiSelect') {
        // For multi-select, check that at least one item is chosen
        if (!Array.isArray(value) || value.length === 0) {
          return { value: 'Please select at least one value' };
        }
      } else if (fieldType !== 'boolean') {
        return { value: 'Value is required' };
      }
    }

    switch (fieldType) {
      case 'text':
        if (value && typeof value !== 'string') {
          return { value: 'Text value must be a string' };
        }
        break;

      case 'number':
      case 'amount':
        if (operator === 'between') {
          if (!value || typeof value !== 'object') {
            return { value: 'Range values are required' };
          }
          const { min, max } = value;
          if (min === '' || min === undefined || min === null) {
            return { value: 'Minimum value is required' };
          }
          if (max === '' || max === undefined || max === null) {
            return { value: 'Maximum value is required' };
          }
          if (isNaN(Number(min))) {
            return { value: 'Minimum value must be a valid number' };
          }
          if (isNaN(Number(max))) {
            return { value: 'Maximum value must be a valid number' };
          }
          if (Number(min) > Number(max)) {
            return { value: 'Minimum value cannot be greater than maximum value' };
          }
        } else {
          if (value === '' || value === undefined || value === null) {
            return { value: 'Number value is required' };
          }
          if (isNaN(Number(value))) {
            return { value: 'Value must be a valid number' };
          }
        }
        break;

      case 'date':
        if (operator === 'between') {
          if (!value || typeof value !== 'object') {
            return { value: 'Date range is required' };
          }
          const { from, to } = value;
          if (!from || from === '') {
            return { value: 'Start date is required' };
          }
          if (!to || to === '') {
            return { value: 'End date is required' };
          }
          const fromDate = new Date(from);
          const toDate = new Date(to);
          if (isNaN(fromDate.getTime())) {
            return { value: 'Start date is invalid' };
          }
          if (isNaN(toDate.getTime())) {
            return { value: 'End date is invalid' };
          }
          if (fromDate > toDate) {
            return { value: 'Start date cannot be after end date' };
          }
        } else {
          if (!value || value === '') {
            return { value: 'Date is required' };
          }
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return { value: 'Invalid date' };
          }
        }
        break;

      case 'singleSelect':
        if (!value || value === '') {
          return { value: 'Please select an option' };
        }
        break;

      case 'multiSelect':
        if (!Array.isArray(value) || value.length === 0) {
          return { value: 'Please select at least one option' };
        }
        break;

      case 'boolean':
        if (value === null || value === undefined) {
          return { value: 'Please select a value' };
        }
        break;

      default:
        break;
    }

    return null;
  }

  /**
   * Validate all filter conditions
   */
  static validateAllConditions(conditions: FilterCondition[]): Map<string, ValidationError> {
    const errors = new Map<string, ValidationError>();

    conditions.forEach(condition => {
      const error = this.validateCondition(condition);
      if (error) {
        errors.set(condition.id, error);
      }
    });

    return errors;
  }

  /**
   * Check if any conditions have errors
   */
  static hasErrors(conditions: FilterCondition[]): boolean {
    return conditions.some(condition => this.validateCondition(condition) !== null);
  }
}

export default FilterValidator;
