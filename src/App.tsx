import { useMemo, useState, useEffect } from 'react';
import { Box, Typography, Stack, Paper, CircularProgress, Alert, Button } from '@mui/material';
import { FilterBuilder } from './components/FilterBuilder';
import { DataTable } from './components/DataTable';
import { FilterEngine } from './utils/filterEngine';
import { FilterValidator } from './utils/filterValidator';
import { employeeApi } from './api/employeeApi';
import { employeeData as defaultEmployeeData } from './data/employees';
import { ExportUtil } from './utils/exportUtil';
import type { FilterState } from './types';
import type { Employee } from './types';
import './api/mockApi'; // Initialize mock API
// Bonus feature: Filter persistence, export to CSV/JSON, regex operators, accessibility, debounced updates

const FILTER_STORAGE_KEY = 'dynamicFilterState';

function App() {
  const [employeeData, setEmployeeData] = useState<Employee[]>(defaultEmployeeData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize filter state from localStorage so filters persist across page refreshes.
  // When the user creates filters, they stay even if they close and reopen the browser.
  // If localStorage is empty or corrupted, we fall back to an empty filter state.
  const [filterState, setFilterState] = useState<FilterState>(() => {
    try {
      const stored = localStorage.getItem(FILTER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : { conditions: [], logicalOperator: 'AND' };
    } catch {
      // If localStorage has bad data, just start fresh
      return { conditions: [], logicalOperator: 'AND' };
    }
  });

  // Whenever the filter state changes, save it to localStorage automatically.
  // This way we don't need a "Save" button - filters are saved in the background.
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filterState));
    } catch (err) {
      console.warn('Failed to save filter state to localStorage:', err);
    }
  }, [filterState]);

  // Fetch data from mock API (with fallback to default data)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await employeeApi.getEmployees();
        // If the API returns real data, use it. Otherwise stick with the default data we already have.
        if (data && data.length > 0) {
          setEmployeeData(data);
        }
      } catch (err) {
        console.warn('Mock API failed, using default data:', err);
        // Don't show an error to the user - we have default data as a fallback
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Apply filters to the employee data. We only include filter conditions that pass validation.
  // Invalid conditions are ignored (with errors shown to the user).
  // This is wrapped in useMemo so we only recalculate when filters or data actually change.
  const filteredData = useMemo(() => {
    // Only apply filters that pass validation
    const validConditions = filterState.conditions.filter(
      condition => !FilterValidator.validateCondition(condition)
    );
    
    return FilterEngine.applyFilters(
      employeeData,
      validConditions,
      filterState.logicalOperator
    );
  }, [filterState, employeeData]);

  return (
    <Box sx={{ backgroundColor: '#f0f2f5', minHeight: '100vh', py: 6, display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1400px', px: 3, margin: '0 auto' }}>
       
        <Paper elevation={3} sx={{ mb: 5, p: 4, backgroundColor: '#fff', borderRadius: 2, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Dynamic Filter Component System
          </Typography>
          <Typography 
            variant="body1" 
            color="textSecondary"
            sx={{ fontSize: '1.1rem', maxWidth: '800px', mx: 'auto' }}
          >
            Data filtering with support for multiple data types and operators
          </Typography>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading Indicator (non-blocking) */}
        {loading && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <CircularProgress size={20} sx={{ mr: 1, verticalAlign: 'middle' }} />
            Syncing with mock API...
          </Alert>
        )}

        <Stack spacing={4}>
          {/* Filter Builder */}
          <FilterBuilder
            filterState={filterState}
            onFiltersChange={setFilterState}
          />

          {/* Export Buttons */}
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => ExportUtil.exportToJSON(filteredData, filterState)}
            >
              Export JSON
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => ExportUtil.exportToCSV(filteredData)}
            >
              Export CSV
            </Button>
          </Stack>

          {/* Results Table */}
          <DataTable
            data={filteredData}
            totalCount={employeeData.length}
            filteredCount={filteredData.length}
          />
        </Stack>

        {/* Footer */}
        <Box sx={{ mt: 8, pt: 4, borderTop: '2px solid #e0e0e0', textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
            © Frontend Developer Assessment - Dynamic Filter Component System
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
            Built with React 18, TypeScript, Material-UI, and Vite
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
