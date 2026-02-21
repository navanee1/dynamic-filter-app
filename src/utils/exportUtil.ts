import type { Employee, FilterState } from '../types';

export class ExportUtil {
  /**
   * Export filtered data to JSON file
   * 
   * Includes metadata about when the export happened and which filters were applied.
   * This way when the user opens the JSON file later, they know exactly what data this represents.
   */
  static exportToJSON(data: Employee[], filterState?: FilterState): void {
    const exportData = {
      exportDate: new Date().toISOString(),
      recordCount: data.length,
      filters: filterState || null,
      data
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.downloadFile(blob, `employee-export-${Date.now()}.json`);
  }

  /**
   * Export filtered data to CSV file
   * 
   * CSV (Comma-Separated Values) is a universal format that works with Excel, Google Sheets, etc.
   * We handle nested objects (like address.city) and arrays (like skills) by flattening them.
   */
  static exportToCSV(data: Employee[]): void {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get all unique keys from all records (including nested ones like address.city)
    const keys = this.getAllKeys(data);

    // Create the header row with all column names
    const header = keys.join(',');

    // Create data rows - one row per employee with values matching the header columns
    const rows = data.map(record => {
      return keys.map(key => {
        const value = this.getNestedValue(record, key);
        // Escape special characters that would break CSV format
        return this.escapeCSVValue(value);
      }).join(',');

    });

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `employee-export-${Date.now()}.csv`);
  }

  /**
   * Get all unique keys from records (including nested keys)
   * 
   * Since different employees might have different data, we need to find ALL possible
   * keys/properties. For example, we'll get both "name", "email", and also nested ones like "address.city".
   * We use a Set to avoid duplicates across all employees.
   */
  private static getAllKeys(data: Employee[]): string[] {
    const keys = new Set<string>();

    data.forEach(record => {
      const flatRecord = this.flattenObject(record);
      Object.keys(flatRecord).forEach(key => keys.add(key));
    });

    return Array.from(keys);
  }

  /**
   * Flatten nested object into dot notation
   * 
   * This converts nested structures into simple key-value pairs:
   * Instead of: { address: { city: "NYC", state: "NY" } }
   * We get:     { "address.city": "NYC", "address.state": "NY" }
   * 
   * Arrays are converted to semicolon-separated strings so they fit in CSV cells.
   */
  private static flattenObject(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    Object.keys(obj).forEach(key => {
      const value = obj[key];
      // Build the full key path (e.g., "address.city")
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // If it's a nested object, recursively flatten it
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        // Join array items with semicolon so they fit in one CSV cell
        // e.g., ["React", "TypeScript", "Node.js"] becomes "React; TypeScript; Node.js"
        flattened[newKey] = value.join('; ');
      } else {
        // Regular primitive value - just add it as-is
        flattened[newKey] = value;
      }
    });

    return flattened;
  }

  /**
   * Get value from object using dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  /**
   * Escape special characters in CSV values
   * 
   * CSV files use commas to separate columns, so if a value CONTAINS a comma,
   * we need to quote it so the CSV parser doesn't think it's a new column.
   * Similarly, we escape any quotes inside the value to avoid breaking the format.
   * 
   * Example:
   * - Input: Smith, John (contains comma)
   * - Output: "Smith, John" (quoted so it's treated as one cell)
   */
  private static escapeCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // Check if the value contains special CSV characters that need escaping
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      // Wrap in quotes and escape any quotes inside by doubling them
      // (CSV standard: "" represents a literal quote character)
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Trigger file download in the browser
   * 
   * This works by creating a temporary download link and simulating a click.
   * The browser will then download the file with the specified filename.
   * Clean up the object URL when done to avoid memory leaks.
   */
  private static downloadFile(blob: Blob, filename: string): void {
    // Create a temporary URL that points to the blob data
    const url = window.URL.createObjectURL(blob);
    // Create an invisible anchor element (download link)
    const link = document.createElement('a');
    link.href = url;
    link.download = filename; // Set the filename for the download
    // Add it to the page and click it
    document.body.appendChild(link);
    link.click();
    // Clean up by removing the link from the page
    document.body.removeChild(link);
    // Revoke the object URL to free up memory
    window.URL.revokeObjectURL(url);
  }
}
