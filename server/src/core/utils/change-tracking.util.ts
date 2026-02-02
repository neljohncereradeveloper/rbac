/**
 * Utility functions for tracking data changes between two states
 */

export interface ChangedField {
  before: any;
  after: any;
}

export interface ChangedFields {
  [field_name: string]: ChangedField;
}

/**
 * Configuration for extracting entity state for change tracking
 */
export interface FieldExtractorConfig {
  /**
   * Field name in the entity
   */
  field: string;
  /**
   * Optional transformer function to format the value (e.g., date formatting)
   * If not provided, the raw value is used
   */
  transform?: (value: any) => any;
}

/**
 * Extracts state from an entity based on field configuration
 * This eliminates the need to manually create before_state and after_state objects
 *
 * @param entity - The entity to extract state from
 * @param config - Array of field configurations defining which fields to extract and how to transform them
 * @returns An object containing the extracted state
 *
 * @example
 * ```typescript
 * const config = [
 *   { field: 'desc1' },
 *   { field: 'updated_at', transform: (val) => val ? getPHDateTime(val) : null },
 *   { field: 'updated_by' },
 * ];
 * const state = extractEntityState(barangay, config);
 * // Returns: { desc1: 'Barangay Name', updated_at: '2024-01-01T10:00:00', updated_by: 'user1' }
 * ```
 */
export function extractEntityState(
  entity: Record<string, any> | null | undefined,
  config: FieldExtractorConfig[],
): Record<string, any> {
  if (!entity) {
    return {};
  }

  const state: Record<string, any> = {};

  for (const { field, transform } of config) {
    const value = entity[field];
    state[field] = transform ? transform(value) : value;
  }

  return state;
}

/**
 * Compares two objects and returns only the fields that have changed
 * with their before and after values.
 *
 * @param before_state - The state before the update
 * @param after_state - The state after the update
 * @param fields_to_check - Optional array of field names to check. If not provided, checks all fields in before_state
 * @returns An object containing only the changed fields with their before and after values
 *
 * @example
 * ```typescript
 * const before = { name: 'John', age: 30, city: 'Manila' };
 * const after = { name: 'John', age: 31, city: 'Manila' };
 * const changed = getChangedFields(before, after);
 * // Returns: { age: { before: 30, after: 31 } }
 * ```
 *
 * @example
 * ```typescript
 * const before = { desc1: 'Old Name', updated_by: 'user1' };
 * const after = { desc1: 'New Name', updated_by: 'user1' };
 * const changed = getChangedFields(before, after, ['desc1', 'updated_by']);
 * // Returns: { desc1: { before: 'Old Name', after: 'New Name' } }
 * ```
 */
export function getChangedFields(
  before_state: Record<string, any>,
  after_state: Record<string, any>,
  fields_to_check?: string[],
): ChangedFields {
  const changed_fields: ChangedFields = {};

  // If fields_to_check is provided, use it; otherwise, check all fields in before_state
  const fields = fields_to_check || Object.keys(before_state);

  for (const field of fields) {
    const before_value = before_state[field];
    const after_value = after_state[field];

    // Deep comparison for objects and arrays
    if (!isEqual(before_value, after_value)) {
      changed_fields[field] = {
        before: before_value,
        after: after_value,
      };
    }
  }

  return changed_fields;
}

/**
 * Deep equality check for two values
 * Handles primitives, objects, arrays, dates, and null/undefined
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if values are equal, false otherwise
 */
function isEqual(a: any, b: any): boolean {
  // Handle null and undefined
  if (a === null || a === undefined) {
    return b === null || b === undefined;
  }
  if (b === null || b === undefined) {
    return false;
  }

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const keys_a = Object.keys(a);
    const keys_b = Object.keys(b);

    if (keys_a.length !== keys_b.length) {
      return false;
    }

    for (const key of keys_a) {
      if (!keys_b.includes(key)) {
        return false;
      }
      if (!isEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  // Handle primitives
  return a === b;
}
