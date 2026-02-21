import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Stack,
  Chip
} from '@mui/material';
import { ArrowUpDown } from 'lucide-react';
import type { Employee } from '../types';
import { getNestedValue } from '../data/fieldDefinitions';

/**
 * DataTable displays the filtered employee records in a sortable table.
 * 
 * Key features:
 * - Shows all filtered results with proper formatting (dates, currencies, etc.)
 * - Click column headers to sort by that column (ascending/descending)
 * - Displays record counts (e.g., "Showing 15 of 55 records")
 * - Handles nested data (like address.city) using dot notation
 * - Formats arrays (like skills) into readable chips
 * - Shows "No records" message when filter results are empty
 */

interface DataTableProps {
  data: Employee[];
  totalCount: number;
  filteredCount: number;
}

type SortOrder = 'asc' | 'desc';

interface SortState {
  field: string | null;
  order: SortOrder;
}

export const DataTable: React.FC<DataTableProps> = ({ data, totalCount, filteredCount }) => {
  // Track which column is currently sorted and in which direction (asc/desc)
  const [sortState, setSortState] = useState<SortState>({ field: null, order: 'asc' });

  // Define which columns to show in the table and their properties
  const columns = [
    { key: 'name', label: 'Name', width: '15%' },
    { key: 'email', label: 'Email', width: '18%' },
    { key: 'department', label: 'Department', width: '12%' },
    { key: 'role', label: 'Role', width: '15%' },
    { key: 'salary', label: 'Salary', width: '12%', align: 'right' as const },
    { key: 'joinDate', label: 'Join Date', width: '12%' },
    { key: 'isActive', label: 'Status', width: '10%' },
    { key: 'skills', label: 'Skills', width: '16%' }
  ];

  // Sort the data based on the current sort state.
  // We use useMemo to avoid re-sorting on every render - only when data or sortState changes.
  const sortedData = useMemo(() => {
    if (!sortState.field) return data; // If no sort field selected, return data as-is

    const sorted = [...data].sort((a, b) => {
      const aVal = getNestedValue(a, sortState.field!)
      const bVal = getNestedValue(b, sortState.field!);

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle different types
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortState.order === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (sortState.order === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return sorted;
  }, [data, sortState]);

  const handleSort = (field: string) => {
    setSortState(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Format values for display in the table. Different field types need different formatting.
  // For example, we show currency with $ sign, dates in readable format, booleans as status chips, etc.
  const formatValue = (value: any, key: string): any => {
    if (value === null || value === undefined) return '-'; // Show dash for empty values

    if (key === 'salary') {
      // Format salary as currency with commas (e.g., $95,000)
      return `$${Number(value).toLocaleString()}`;
    }

    if (key === 'joinDate' || key === 'lastReview') {
      // Format dates in readable format (e.g., "Jan 15, 2024")
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    if (key === 'isActive') {
      // Show boolean as colored status chip (Active/Inactive)
      return value ? (
        <Chip label="Active" color="success" size="small" />
      ) : (
        <Chip label="Inactive" color="error" size="small" />
      );
    }

    if (key === 'skills' && Array.isArray(value)) {
      // Show skills as chips, but limit to 2 and show "+N more" if there are more
      // This keeps the table row from getting too tall
      return (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
          {value.slice(0, 2).map(skill => (
            <Chip key={skill} label={skill} size="small" variant="outlined" />
          ))}
          {value.length > 2 && <Chip label={`+${value.length - 2}`} size="small" variant="outlined" />}
        </Stack>
      );
    }

    // For other arrays, join them with commas
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    // For objects, convert to JSON string representation
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return value;
  };

  return (
    <Paper elevation={0} sx={{ backgroundColor: '#fff' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Stack direction="row" spacing={2}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Total Records
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {totalCount}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Filtered Results
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
              {filteredCount}
            </Typography>
          </Box>
          {filteredCount !== totalCount && (
            <Box>
              <Typography variant="caption" color="textSecondary">
                Match Rate
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {((filteredCount / totalCount) * 100).toFixed(1)}%
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <TableContainer>
        {data.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No records match your filters
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Try adjusting your filter criteria
            </Typography>
          </Box>
        ) : (
          <Table sx={{ minWidth: 650 }} aria-label="employee table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {columns.map(col => (
                  <TableCell
                    key={col.key}
                    align={col.align}
                    sx={{
                      width: col.width,
                      fontWeight: 600,
                      color: '#333',
                      padding: '16px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      '&:hover': {
                        backgroundColor: '#eeeeee'
                      }
                    }}
                    onClick={() => handleSort(col.key)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{col.label}</span>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: sortState.field === col.key ? '#1976d2' : '#999',
                          transition: 'color 0.2s ease'
                        }}
                      >
                        <ArrowUpDown size={16} />
                      </Box>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row, idx) => (
                <TableRow
                  key={row.id}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                >
                  {columns.map(col => (
                    <TableCell
                      key={`${row.id}-${col.key}`}
                      align={col.align}
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {formatValue(getNestedValue(row, col.key), col.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Paper>
  );
};
