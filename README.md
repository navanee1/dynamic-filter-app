# Dynamic Filter Component System

This is a React filtering app that I built to handle multiple data types. It's got a nice UI, real-time validation, and bonus features like exporting to CSV/JSON and filter persistence.

## What's included

**Core stuff:**
- Dynamic filter builder - add/remove filters on the fly
- Handles 8 different data types (text, numbers, dates, amounts, selects, multi-selects, booleans)
- AND/OR logic to combine filters however you want
- Real validation that shows you errors immediately
- Works with nested objects and arrays
- 55 sample employee records to test with

**Bonus features:**
- Filters automatically save to localStorage (persists across page refreshes)
- Export filtered data as JSON or CSV
- Regex support for advanced text searching
- Debounced updates so it runs smooth (150ms delay)
- Accessibility stuff built in (ARIA labels, tooltips)

## Getting started

**Setup:**
```bash
cd dynamic-filter-app
npm install
npm run dev
```

App opens at `http://localhost:5176` (or whatever port is available)

**Build:**
```bash
npm run build
npm run preview  # test the production build locally
```

## How the project is organized

```
src/
├── components/
│   ├── DataTable.tsx              # table that shows results + sorting
│   ├── FilterBuilder.tsx           # the main filter UI
│   ├── FilterCondition.tsx         # individual filter row
│   ├── FilterInputs.tsx            # input components for different types
│
├── utils/
│   ├── filterEngine.ts             # does the actual filtering
│   ├── filterValidator.ts          # validates filter conditions
│   ├── exportUtil.ts               # handles CSV/JSON exports
│   ├── debounce.ts                 # debounce hook
│
├── api/
│   ├── mockApi.ts                  # mocks the API
│   ├── employeeApi.ts              # API service
│
├── data/
│   ├── employees.ts                # 55 employee records
│   ├── fieldDefinitions.ts         # field config and operators
│
├── types/
│   └── index.ts                    # TypeScript types
│
├── App.tsx                         # main app component
└── main.tsx                        # entry point
```

## How to use it

### Basic FilterBuilder usage

```tsx
import { FilterBuilder } from './components/FilterBuilder';
import type { FilterState } from './types';

function MyComponent() {
  const [filterState, setFilterState] = useState<FilterState>({
    conditions: [],
    logicalOperator: 'AND'
  });

  return (
    <FilterBuilder 
      filterState={filterState}
      onFiltersChange={setFilterState}
    />
  );
}
```

### Apply filters to your data

```tsx
import { FilterEngine } from './utils/filterEngine';
import { FilterValidator } from './utils/filterValidator';

function MyApp({ employeeData }: { employeeData: Employee[] }) {
  const [filterState, setFilterState] = useState<FilterState>({
    conditions: [],
    logicalOperator: 'AND'
  });

  // this only recalculates when filterState changes
  const filteredData = useMemo(() => {
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
    <>
      <FilterBuilder 
        filterState={filterState}
        onFiltersChange={setFilterState}
      />
      <DataTable 
        data={filteredData}
        totalCount={employeeData.length}
        filteredCount={filteredData.length}
      />
    </>
  );
}
```

### Export data to CSV or JSON

```tsx
import { ExportUtil } from './utils/exportUtil';

function MyComponent({ filteredData, filterState }) {
  return (
    <Stack direction="row" spacing={2}>
      <Button 
        onClick={() => ExportUtil.exportToJSON(filteredData, filterState)}
      >
        Export JSON
      </Button>
      
      <Button 
        onClick={() => ExportUtil.exportToCSV(filteredData)}
      >
        Export CSV
      </Button>
    </Stack>
  );
}
```

### Build a filter manually

```tsx
import type { FilterCondition } from './types';
import { v4 as uuidv4 } from 'uuid';

// filter for "name contains John"
const nameFilter: FilterCondition = {
  id: uuidv4(),
  field: 'name',
  fieldType: 'text',
  operator: 'contains',
  value: 'John',
  logicalOperator: 'AND'
};

// filter for "salary between 50k and 100k"
const salaryFilter: FilterCondition = {
  id: uuidv4(),
  field: 'salary',
  fieldType: 'amount',
  operator: 'between',
  value: { min: 50000, max: 100000 },
  logicalOperator: 'AND'
};

// use them
const filterState: FilterState = {
  conditions: [nameFilter, salaryFilter],
  logicalOperator: 'AND'
};
```

## Available fields

```tsx
fieldDefinitions = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    operators: ['equals', 'contains', 'startsWith', 'endsWith', 'notContains', 'regex']
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
    key: 'department',
    label: 'Department',
    type: 'singleSelect',
    operators: ['is', 'isNot'],
    options: [
      { label: 'Engineering', value: 'Engineering' },
      { label: 'Sales', value: 'Sales' },
      // ...
    ]
  },
  {
    key: 'skills',
    label: 'Skills',
    type: 'multiSelect',
    operators: ['in', 'notIn', 'containsAll'],
    options: [
      { label: 'React', value: 'React' },
      { label: 'TypeScript', value: 'TypeScript' },
      // ...
    ]
  },
  {
    key: 'isActive',
    label: 'Active Status',
    type: 'boolean',
    operators: ['is']
  }
  // more fields...
];
```

## Example filters

**Find names with "John"**
```
Field: Name
Operator: contains
Value: "John"
```

**Get people earning $80k-$120k**
```
Field: Salary
Operator: between
Value: { min: 80000, max: 120000 }
```

**Find engineers making over $90k (AND)**
```
Condition 1: Department = Engineering
Condition 2: Salary > 90000
Logical Operator: AND
```

**Find sales OR marketing people (OR)**
```
Condition 1: Department = Sales
Condition 2: Department = Marketing
Logical Operator: OR
```

**Advanced regex - find specific email patterns**
```
Field: Email
Operator: regex
Value: "^[a-z]+\.(smith|johnson)@"
```

## Filter persistence

Your filters automatically save to localStorage. Close the browser, come back later, and they're still there. It uses the key `dynamicFilterState`.

```tsx
// loads automatically on start
const [filterState] = useState(() => {
  const stored = localStorage.getItem('dynamicFilterState');
  return stored ? JSON.parse(stored) : { conditions: [], logicalOperator: 'AND' };
});

// saves automatically whenever it changes
useEffect(() => {
  try {
    localStorage.setItem('dynamicFilterState', JSON.stringify(filterState));
  } catch (err) {
    console.warn('Failed to save:', err);
  }
}, [filterState]);
```

Clear it if you want:
```tsx
localStorage.removeItem('dynamicFilterState');
```

## What gets validated

The validator checks:
- You picked a field (obvious, right?)
- You picked an operator
- The operator makes sense for that field type
- You actually entered a value that makes sense

| Type | Check |
|------|-------|
| Text | must have a value |
| Number | must be a real number |
| Date | must be valid date(s) |
| Amount | must be a valid number |
| Single Select | something picked |
| Multi-Select | at least one picked |
| Boolean | always ok |

Errors show up right away in red below the filter.

## Tech stack

- React 18.3.1
- TypeScript 5.9.3
- Vite 7.3.1
- Material-UI v7 (40+ components)
- Lucide React (icons)
- Axios (HTTP)
- UUID (IDs)

## Type definitions

```typescript
interface FilterCondition {
  id: string;                     // unique id
  field: string;                  // which field (e.g., 'name')
  fieldType: 'text' | 'number' | 'date' | ...;
  operator: string;               // how to filter (e.g., 'contains')
  value: any;                     // what the user entered
  nestedKey?: string;             // for nested stuff like address.city
  logicalOperator: 'AND' | 'OR';
}

interface FilterState {
  conditions: FilterCondition[];
  logicalOperator: 'AND' | 'OR';
}

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  joinDate: string;
  isActive: boolean;
  skills: string[];
  address: { city: string; state: string; country: string };
  projects: number;
  lastReview: string;
  performanceRating: number;
}
```

## Customizing it

**Add a new field:**

Edit `src/data/fieldDefinitions.ts`:

```typescript
{
  key: 'myNewField',
  label: 'My New Field',
  type: 'text',
  operators: ['equals', 'contains'],
  nestedKey: 'path.to.field'  // if it's nested
}
```

**Add a new operator:**

1. Update types in `src/types/index.ts`
2. Add logic in `src/utils/filterEngine.ts`
3. If you need a custom input, add it in `src/components/FilterInputs.tsx`

**Change export format:**

Edit `src/utils/exportUtil.ts` to customize JSON or CSV structure.

## Debugging

**Check filter state in console:**
```javascript
const filterState = JSON.parse(localStorage.getItem('dynamicFilterState'));
console.log(filterState);
```

**Test a regex:**
```javascript
const regex = new RegExp('mypattern', 'i');
regex.test('test string');
```

## Performance

- Filter changes are debounced at 150ms (so it doesn't flip out if you're typing fast)
- useMemo is used for filtered data and sorting (only recalculates when needed)
- Sorting only runs when the sort field actually changes

## What's done

- ✅ Filter builder that actually works
- ✅ All 8 data types
- ✅ AND/OR logic
- ✅ Real-time validation
- ✅ 55 sample employees
- ✅ Sortable table
- ✅ Material-UI + Lucide icons
- ✅ TypeScript everywhere
- ✨ Filter persistence (localStorage)
- ✨ CSV/JSON export
- ✨ Regex matching
- ✨ Accessibility (ARIA, tooltips)
- ✨ Debounced updates

---

Feb 2026. Check the code comments if you need more details - there's a lot of explanation in there.
