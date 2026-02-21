import type { Employee, FilterCondition } from '../types';
import { getNestedValue } from '../data/fieldDefinitions';

export class FilterEngine {
  /**
   * Apply filters to employee data
   * 
   * This is the core filtering logic. It takes employee records and filter conditions,
   * then returns only the records that match all (AND) or any (OR) of the conditions.
   * 
   * For example, if you filter AND [department=Engineering, salary > 80000],
   * you only get people in Engineering who earn more than 80k.
   * But if you use OR, you get anyone in Engineering OR earning >80k.
   */
  static applyFilters(
    data: Employee[],
    conditions: FilterCondition[],
    logicalOperator: 'AND' | 'OR' = 'AND'
  ): Employee[] {
    // If there are no filters, show everything
    if (conditions.length === 0) {
      return data;
    }

    return data.filter(record => {
      if (logicalOperator === 'AND') {
        // ALL conditions must be true for this record
        // If even one condition fails, don't include this record
        return conditions.every(condition => this.evaluateCondition(record, condition));
      } else {
        // AT LEAST ONE condition must be true
        // If any condition matches, include this record
        return conditions.some(condition => this.evaluateCondition(record, condition));
      }
    });
  }

  /**
   * Evaluate a single filter condition
   */
  private static evaluateCondition(record: Employee, condition: FilterCondition): boolean {
    const fieldKey = condition.nestedKey || condition.field;
    const value = getNestedValue(record, fieldKey);

    switch (condition.fieldType) {
      case 'text':
        return this.evaluateTextFilter(value, condition.operator as any, condition.value);
      case 'number':
        return this.evaluateNumberFilter(value, condition.operator as any, condition.value);
      case 'date':
        return this.evaluateDateFilter(value, condition.operator as any, condition.value);
      case 'amount':
        return this.evaluateAmountFilter(value, condition.operator as any, condition.value);
      case 'singleSelect':
        return this.evaluateSelectFilter(value, condition.operator as any, condition.value);
      case 'multiSelect':
        return this.evaluateMultiSelectFilter(value, condition.operator as any, condition.value);
      case 'boolean':
        return this.evaluateBooleanFilter(value, condition.operator as any, condition.value);
      default:
        return true;
    }
  }

  /**
   * Text field filtering
   * 
   * Handles filtering for text data (name, email, role, etc.).
   * Supports various operators like "contains", "startsWith", "regex", etc.
   * We do case-insensitive matching for better UX (user doesn't have to worry about capitalization).
   */
  private static evaluateTextFilter(
    value: any,
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'notContains' | 'regex',
    filterValue: string
  ): boolean {
    if (value === null || value === undefined) return false;

    const strValue = String(value).toLowerCase();
    const strFilter = String(filterValue).toLowerCase();

    switch (operator) {
      case 'equals':
        return strValue === strFilter;
      case 'contains':
        return strValue.includes(strFilter);
      case 'startsWith':
        return strValue.startsWith(strFilter);
      case 'endsWith':
        return strValue.endsWith(strFilter);
      case 'notContains':
        return !strValue.includes(strFilter);
      case 'regex':
        // Allow advanced regex patterns. If the user enters invalid regex, we catch the error
        // and return false rather than crashing the app
        try {
          const regex = new RegExp(strFilter, 'i'); // 'i' flag makes it case-insensitive
          return regex.test(String(value));
        } catch {
          // Invalid regex pattern - silently fail and don't match
          return false;
        }
      default:
        return true;
    }
  }

  /**
   * Number field filtering
   */
  private static evaluateNumberFilter(
    value: any,
    operator: 'equals' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'between',
    filterValue: any
  ): boolean {
    if (value === null || value === undefined) return false;

    const numValue = Number(value);
    if (isNaN(numValue)) return false;

    switch (operator) {
      case 'equals':
        return numValue === Number(filterValue);
      case 'greaterThan':
        return numValue > Number(filterValue);
      case 'lessThan':
        return numValue < Number(filterValue);
      case 'greaterThanOrEqual':
        return numValue >= Number(filterValue);
      case 'lessThanOrEqual':
        return numValue <= Number(filterValue);
      case 'between':
        const { min, max } = filterValue;
        return numValue >= Number(min) && numValue <= Number(max);
      default:
        return true;
    }
  }

  /**
   * Date field filtering
   */
  private static evaluateDateFilter(
    value: any,
    operator: 'equals' | 'before' | 'after' | 'between',
    filterValue: any
  ): boolean {
    if (!value) return false;

    const date = new Date(value);
    if (isNaN(date.getTime())) return false;

    switch (operator) {
      case 'equals':
        const filterDate = new Date(filterValue);
        return date.toDateString() === filterDate.toDateString();
      case 'before':
        return date < new Date(filterValue);
      case 'after':
        return date > new Date(filterValue);
      case 'between':
        const fromDate = new Date(filterValue.from);
        const toDate = new Date(filterValue.to);
        return date >= fromDate && date <= toDate;
      default:
        return true;
    }
  }

  /**
   * Amount/Currency field filtering
   */
  private static evaluateAmountFilter(
    value: any,
    operator: 'equals' | 'between' | 'greaterThan' | 'lessThan',
    filterValue: any
  ): boolean {
    return this.evaluateNumberFilter(value, operator as any, filterValue);
  }

  /**
   * Single select field filtering
   */
  private static evaluateSelectFilter(
    value: any,
    operator: 'is' | 'isNot',
    filterValue: any
  ): boolean {
    if (value === null || value === undefined) return operator === 'isNot';

    const matches = String(value) === String(filterValue);
    return operator === 'is' ? matches : !matches;
  }

  /**
   * Multi-select field filtering (arrays)
   */
  private static evaluateMultiSelectFilter(
    value: any,
    operator: 'in' | 'notIn' | 'containsAll',
    filterValue: any
  ): boolean {
    if (!Array.isArray(value)) {
      if (!value) return operator === 'notIn';
      value = [value];
    }

    const filterArray = Array.isArray(filterValue) ? filterValue : [filterValue];

    switch (operator) {
      case 'in':
        // At least one element of value is in filterArray
        return value.some((v: any) => filterArray.includes(v));
      case 'notIn':
        // No element of value is in filterArray
        return !value.some((v: any) => filterArray.includes(v));
      case 'containsAll':
        // All elements of filterArray are in value
        return filterArray.every((f: any) => value.includes(f));
      default:
        return true;
    }
  }

  /**
   * Boolean field filtering
   */
  private static evaluateBooleanFilter(
    value: any,
    _operator: 'is',
    filterValue: any
  ): boolean {
    const boolValue = Boolean(value);
    const boolFilter = String(filterValue).toLowerCase() === 'true';
    return boolValue === boolFilter;
  }
}

export default FilterEngine;
