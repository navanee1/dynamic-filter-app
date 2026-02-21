import React from 'react';
import { Box, TextField, MenuItem, Select, FormControl, InputLabel, FormControlLabel, Switch, Chip, Stack } from '@mui/material';

/**
 * Collection of reusable input components for different data types.
 * 
 * Each component is kept simple and focused on a single input type:
 * - TextInput: Simple text field
 * - NumberInput: Numeric input with validation
 * - DateInput: Single date picker
 * - DateRangeInput: Two date pickers for "from" and "to" dates
 * - AmountRangeInput: Two number fields for min/max amounts (usually with currency formatting)
 * - SelectInput: Dropdown for single selection
 * - MultiSelectInput: Dropdown with checkboxes for multiple selections
 * - BooleanInput: Toggle switch for true/false
 * 
 * These are used by FilterCondition to render the appropriate input based on field type.
 */

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, placeholder }) => (
  <TextField
    size="small"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    fullWidth
  />
);

interface NumberInputProps {
  value: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, placeholder, min, max }) => (
  <TextField
    size="small"
    type="number"
    value={value}
    onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
    placeholder={placeholder}
    inputProps={{ min, max }}
    fullWidth
  />
);

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const DateInput: React.FC<DateInputProps> = ({ value, onChange }) => (
  <TextField
    size="small"
    type="date"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    InputLabelProps={{ shrink: true }}
    fullWidth
  />
);

interface DateRangeInputProps {
  fromDate: string;
  toDate: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export const DateRangeInput: React.FC<DateRangeInputProps> = ({
  fromDate,
  toDate,
  onFromChange,
  onToChange
}) => (
  <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
    <TextField
      size="small"
      type="date"
      value={fromDate}
      onChange={(e) => onFromChange(e.target.value)}
      label="From"
      InputLabelProps={{ shrink: true }}
      focused
      sx={{ flex: 1 }}
    />
    <TextField
      size="small"
      type="date"
      value={toDate}
      onChange={(e) => onToChange(e.target.value)}
      label="To"
      InputLabelProps={{ shrink: true }}
      focused
      sx={{ flex: 1 }}
    />
  </Stack>
);

interface AmountRangeInputProps {
  min: number | string;
  max: number | string;
  onMinChange: (value: number | string) => void;
  onMaxChange: (value: number | string) => void;
}

export const AmountRangeInput: React.FC<AmountRangeInputProps> = ({
  min,
  max,
  onMinChange,
  onMaxChange
}) => (
  <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
    <TextField
      size="small"
      type="number"
      value={min}
      onChange={(e) => onMinChange(e.target.value === '' ? '' : Number(e.target.value))}
      label="Min"
      fullWidth
    />
    <TextField
      size="small"
      type="number"
      value={max}
      onChange={(e) => onMaxChange(e.target.value === '' ? '' : Number(e.target.value))}
      label="Max"
      fullWidth
    />
  </Stack>
);

interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string | number }>;
}

export const SelectInput: React.FC<SelectInputProps> = ({ value, onChange, options }) => (
  <FormControl size="small" fullWidth>
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <MenuItem value="">
        <em>Select an option</em>
      </MenuItem>
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

interface MultiSelectInputProps {
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  options: Array<{ label: string; value: string | number }>;
}

export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
  value,
  onChange,
  options
}) => {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>Select skills</InputLabel>
      <Select
        multiple
        value={value}
        onChange={(e) => onChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(Array.isArray(selected) ? selected : []).map((val) => (
              <Chip
                key={val}
                label={options.find(o => o.value === val)?.label || val}
                size="small"
              />
            ))}
          </Box>
        )}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

interface BooleanInputProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const BooleanInput: React.FC<BooleanInputProps> = ({ value, onChange }) => (
  <FormControlLabel
    control={
      <Switch
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    }
    label={value ? 'Yes' : 'No'}
  />
);
