import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { Plus, RotateCcw, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { FilterCondition, FilterState } from '../types';
import { FilterConditionComponent } from './FilterCondition';
import { FilterValidator } from '../utils/filterValidator';

interface FilterBuilderProps {
  filterState: FilterState;
  onFiltersChange: (filterState: FilterState) => void;
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  filterState,
  onFiltersChange
}) => {
  // We use a ref to store the debounce timeout ID so we can cancel it if the user
  // quickly changes filters multiple times. This prevents unnecessary re-renders
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for validation errors in current filters
  const validationErrors = useMemo(() => {
    return FilterValidator.validateAllConditions(filterState.conditions);
  }, [filterState.conditions]);

  // Only show errors if there are validation errors for conditions that have a field selected
  // This avoids showing errors for empty conditions the user just added but hasn't filled in yet
  const hasErrors = filterState.conditions.some(condition => {
    return condition.field !== '' && validationErrors.has(condition.id);
  });

  // When filters change, we wait 150ms before actually updating the parent component.
  // This reduces noise if the user is rapidly typing or clicking. For example, if they
  // type "John" in a text field quickly, we don't want to filter after each keystroke.
  const handleFiltersChangeDebounced = useCallback((newFilterState: FilterState) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      onFiltersChange(newFilterState);
    }, 150);
  }, [onFiltersChange]);

  // Make sure to clean up the timeout when component unmounts, otherwise
  // it could cause memory leaks if setTimeout is still pending
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleAddFilter = () => {
    const newCondition: FilterCondition = {
      id: uuidv4(),
      field: '',
      fieldType: 'text',
      operator: 'equals',
      value: '',
      logicalOperator: 'AND'
    };

    onFiltersChange({
      ...filterState,
      conditions: [...filterState.conditions, newCondition]
    });
  };

  const handleUpdateCondition = (id: string, updatedCondition: FilterCondition) => {
    const newFilterState = {
      ...filterState,
      conditions: filterState.conditions.map(c => c.id === id ? updatedCondition : c)
    };
    // Use debounced update for value-only changes
    handleFiltersChangeDebounced(newFilterState);
  };

  const handleRemoveCondition = (id: string) => {
    onFiltersChange({
      ...filterState,
      conditions: filterState.conditions.filter(c => c.id !== id)
    });
  };

  const handleClearAll = () => {
    onFiltersChange({
      ...filterState,
      conditions: []
    });
  };

  return (
    <Paper elevation={0} sx={{ p: 3, backgroundColor: '#fafafa', borderRadius: 1 }} role="region" aria-label="Filter builder">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }} id="filters-heading">
            Filters
          </Typography>

          {hasErrors && (
            <Alert severity="warning" icon={<AlertCircle size={20} />} sx={{ mb: 2 }}>
              Some filters have validation errors. Please fix them before the filters will be applied.
            </Alert>
          )}

          {filterState.conditions.length > 0 && !hasErrors && (
            <Card sx={{ mb: 2, backgroundColor: '#fff3e0' }}>
              <CardContent sx={{ py: 1.5, px: 2 }}>
                <FormControlLabel
                  label="Match"
                  control={
                    <RadioGroup
                      row
                      value={filterState.logicalOperator}
                      onChange={(e) =>
                        onFiltersChange({
                          ...filterState,
                          logicalOperator: e.target.value as 'AND' | 'OR'
                        })
                      }
                    >
                      <FormControlLabel value="AND" control={<Radio size="small" />} label="ALL filters (AND)" />
                      <FormControlLabel value="OR" control={<Radio size="small" />} label="ANY filter (OR)" />
                    </RadioGroup>
                  }
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
                  {filterState.logicalOperator === 'AND'
                    ? 'Records must match all filters below'
                    : 'Records matching any of the filters below will be shown'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Filter Conditions */}
        <Box>
          {filterState.conditions.map((condition, index) => (
            <React.Fragment key={condition.id}>
              {index > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: filterState.logicalOperator === 'AND' ? '#e3f2fd' : '#f3e5f5',
                      p: 1,
                      borderRadius: 1,
                      textAlign: 'center',
                      fontWeight: 600,
                      color: filterState.logicalOperator === 'AND' ? '#1565c0' : '#6a1b9a'
                    }}
                  >
                    {filterState.logicalOperator}
                  </Typography>
                </Box>
              )}
              <FilterConditionComponent
                condition={condition}
                onConditionChange={(updated) => handleUpdateCondition(condition.id, updated)}
                onRemove={() => handleRemoveCondition(condition.id)}
              />
            </React.Fragment>
          ))}
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={handleAddFilter}
            sx={{ textTransform: 'none' }}
            aria-label="Add a new filter condition"
            title="Click to add a new filter condition (Ctrl+Alt+A)"
          >
            Add Filter
          </Button>
          {filterState.conditions.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<RotateCcw size={18} />}
              onClick={handleClearAll}
              sx={{ textTransform: 'none' }}
              aria-label="Clear all filters"
              title="Remove all filter conditions"
            >
              Clear All
            </Button>
          )}
        </Stack>

        {filterState.conditions.length === 0 && (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
            No filters applied. Click "Add Filter" to create one.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};
