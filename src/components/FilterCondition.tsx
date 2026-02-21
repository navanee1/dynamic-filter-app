import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  IconButton,
  Grid,
  Alert
} from '@mui/material';
import { Trash2 } from 'lucide-react';
import type { FilterCondition } from '../types';
import {
  TextInput,
  NumberInput,
  DateInput,
  DateRangeInput,
  AmountRangeInput,
  SelectInput,
  MultiSelectInput,
  BooleanInput
} from './FilterInputs';
import { fieldDefinitions } from '../data/fieldDefinitions';
import { FilterValidator } from '../utils/filterValidator';

interface FilterConditionProps {
  condition: FilterCondition;
  onConditionChange: (condition: FilterCondition) => void;
  onRemove: () => void;
}

export const FilterConditionComponent: React.FC<FilterConditionProps> = ({
  condition,
  onConditionChange,
  onRemove
}) => {
  const [validationError, setValidationError] = useState<any>(null);

  // We need to find the field definition so we can show the correct operators and input type.
  // For example, a "salary" field is an amount type, so we show amount-specific operators.
  // We memoize this to avoid searching the array on every render.
  const selectedField = useMemo(
    () => fieldDefinitions.find(f => f.key === condition.field),
    [condition.field]
  );

  // When the user picks a different field, we need to reset the operator and value.
  // For example, if they were filtering text, but switch to filtering a date field,
  // the previous text operators (contains, startsWith, etc.) don't make sense anymore.
  const handleFieldChange = (fieldKey: string) => {
    const field = fieldDefinitions.find(f => f.key === fieldKey);
    if (field) {
      const updated = {
        ...condition,
        field: fieldKey,
        fieldType: field.type,
        operator: field.operators[0], // Use the first available operator for this field type
        value: getDefaultValue(field.type),
        nestedKey: field.nestedKey
      };
      onConditionChange(updated);
      // Check if this new configuration is valid
      const error = FilterValidator.validateCondition(updated);
      setValidationError(error);
    }
  };

  const handleOperatorChange = (operator: string) => {
    // When operator changes, we need to reset the value. For example:
    // - "equals" might use a single number, but "between" uses min/max
    // - "single select" uses a string, but "multi-select" uses an array
    // So changing the operator means changing the value structure.
    const updated = {
      ...condition,
      operator: operator as any,
      value: getDefaultValue(condition.fieldType, operator)
    };
    onConditionChange(updated);
    // Validate to ensure the new operator + value combo makes sense
    const error = FilterValidator.validateCondition(updated);
    setValidationError(error);
  };

  const handleValueChange = (newValue: any) => {
    // This is called when the user types/selects a value in the input field.
    // We validate in real-time so the user sees errors immediately
    const updated = { ...condition, value: newValue };
    onConditionChange(updated);
    // Validate the updated condition
    const error = FilterValidator.validateCondition(updated);
    setValidationError(error);
  };

  const renderValueInput = () => {
    // This function determines which input component to show based on the field type.
    // For example, dates need a date picker, numbers need numeric validation, etc.
    if (!selectedField) return null;

    switch (selectedField.type) {
      case 'text':
        // Simple text input for text fields (name, email, etc.)
        return (
          <TextInput
            value={condition.value || ''}
            onChange={(val) => handleValueChange(val)}
            placeholder="Enter text"
          />
        );

      case 'number':
      case 'amount':
        // Both number and amount fields are numeric, but they show "between" differently
        // Number "between" shows min/max for ranges like "salary between 50k-100k"
        if (condition.operator === 'between') {
          return (
            <AmountRangeInput
              min={condition.value?.min || ''}
              max={condition.value?.max || ''}
              onMinChange={(val) =>
                handleValueChange({
                  ...condition.value,
                  min: val
                })
              }
              onMaxChange={(val) =>
                handleValueChange({
                  ...condition.value,
                  max: val
                })
              }
            />
          );
        } else {
          return (
            <NumberInput
              value={condition.value || ''}
              onChange={(val) => handleValueChange(val)}
              placeholder="Enter number"
            />
          );
        }

      case 'date':
        if (condition.operator === 'between') {
          return (
            <DateRangeInput
              fromDate={condition.value?.from || ''}
              toDate={condition.value?.to || ''}
              onFromChange={(val) =>
                handleValueChange({
                  ...condition.value,
                  from: val
                })
              }
              onToChange={(val) =>
                handleValueChange({
                  ...condition.value,
                  to: val
                })
              }
            />
          );
        } else {
          return (
            <DateInput
              value={condition.value || ''}
              onChange={(val) => handleValueChange(val)}
            />
          );
        }

      case 'singleSelect':
        return (
          <SelectInput
            value={condition.value || ''}
            onChange={(val) => handleValueChange(val)}
            options={selectedField.options || []}
          />
        );

      case 'multiSelect':
        return (
          <MultiSelectInput
            value={Array.isArray(condition.value) ? condition.value : []}
            onChange={(val) => handleValueChange(val)}
            options={selectedField.options || []}
          />
        );

      case 'boolean':
        return (
          <BooleanInput
            value={condition.value === 'true' || condition.value === true}
            onChange={(val) => handleValueChange(val)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card sx={{ mb: 2, backgroundColor: validationError ? '#ffebee' : '#f5f5f5', borderColor: validationError ? '#ef5350' : 'transparent', borderWidth: validationError ? 2 : 0, borderStyle: 'solid' }}>
      <CardContent>
        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {validationError.field || validationError.operator || validationError.value || validationError.general}
          </Alert>
        )}
        <Grid container spacing={2}>
          {/* Field Selection */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="field-select-label">Field</InputLabel>
              <Select
                labelId="field-select-label"
                value={condition.field}
                onChange={(e) => handleFieldChange(e.target.value)}
                label="Field"
                aria-label="Select a field to filter on"
                title="Choose which field you want to filter"
              >
                {fieldDefinitions.map((field) => (
                  <MenuItem key={field.key} value={field.key}>
                    {field.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Operator Selection */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth size="small" disabled={!selectedField}>
              <InputLabel id="operator-select-label">Operator</InputLabel>
              <Select
                labelId="operator-select-label"
                value={condition.operator}
                onChange={(e) => handleOperatorChange(e.target.value)}
                label="Operator"
                aria-label="Select a filter operator"
                title="Choose how to compare the values"
              >
                {selectedField?.operators.map((op) => (
                  <MenuItem key={op} value={op}>
                    {getOperatorLabel(op)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Value Input */}
          <Grid size={{ xs: 12, sm: 5 }}>
            {renderValueInput()}
          </Grid>

          {/* Delete Button */}
          <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              onClick={onRemove}
              color="error"
              size="small"
              title="Remove this filter"
              aria-label={`Remove filter for ${selectedField?.label || 'field'}`}
            >
              <Trash2 size={20} />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

function getOperatorLabel(operator: string): string {
  const labels: { [key: string]: string } = {
    // Text operators
    equals: 'Equals',
    contains: 'Contains',
    startsWith: 'Starts With',
    endsWith: 'Ends With',
    notContains: 'Does Not Contain',
    regex: 'Regex Pattern',

    // Number operators
    greaterThan: 'Greater Than',
    lessThan: 'Less Than',
    greaterThanOrEqual: 'Greater Than or Equal',
    lessThanOrEqual: 'Less Than or Equal',
    between: 'Between',

    // Date operators
    before: 'Before',
    after: 'After',

    // Select operators
    is: 'Is',
    isNot: 'Is Not',

    // Multi-select operators
    in: 'In',
    notIn: 'Not In',
    containsAll: 'Contains All'
  };

  return labels[operator] || operator;
}

function getDefaultValue(fieldType: string, operator?: string): any {
  if (operator === 'between') {
    if (fieldType === 'date') {
      return { from: '', to: '' };
    } else {
      return { min: '', max: '' };
    }
  }

  switch (fieldType) {
    case 'text':
      return '';
    case 'number':
    case 'amount':
      return '';
    case 'date':
      return '';
    case 'boolean':
      return true;
    case 'singleSelect':
      return '';
    case 'multiSelect':
      return [];
    default:
      return '';
  }
}
