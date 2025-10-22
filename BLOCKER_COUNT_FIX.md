# Blocker Count Fix

## Error

```
TypeError: blockers.trim is not a function
at standupUtils.ts:2:29
```

## Root Cause

The `countBlockers` function in `client/src/utils/standupUtils.ts` was expecting a string parameter, but the backend returns `blockers` as an array of strings (based on the Standup model schema).

**Backend Schema:**
```typescript
// server/models/Standup.ts
blockers: [String]  // Array of strings
```

**Frontend Function (Before Fix):**
```typescript
export const countBlockers = (blockers: string): number => {
  if (!blockers || blockers.trim() === '') return 0;  // ❌ .trim() doesn't exist on arrays
  // ...
}
```

## Solution

Updated `countBlockers` to handle both string and array formats:

```typescript
export const countBlockers = (blockers: string | string[]): number => {
  if (!blockers) return 0;

  // If it's an array, count non-empty items
  if (Array.isArray(blockers)) {
    return blockers.filter(item => item && item.trim() !== '').length;
  }

  // If it's a string, count non-empty lines (backwards compatibility)
  if (typeof blockers === 'string') {
    if (blockers.trim() === '') return 0;
    const lines = blockers.split('\n').filter(line => line.trim() !== '');
    return lines.length;
  }

  return 0;
};
```

## Why It Works

1. **Type Guard:** Checks if `blockers` is an array using `Array.isArray()`
2. **Array Handling:** If array, filters out empty items and returns count
3. **String Handling:** If string, splits by newlines and counts non-empty lines
4. **Backwards Compatible:** Handles both formats for any legacy data

## Files Changed

- `client/src/utils/standupUtils.ts` (lines 1-18)

## Testing

The function now correctly handles:

```typescript
// Array format (from backend)
countBlockers(['Waiting for API', 'Need design approval'])  // Returns: 2
countBlockers([''])  // Returns: 0
countBlockers([])  // Returns: 0

// String format (legacy or form input)
countBlockers('Waiting for API\nNeed design approval')  // Returns: 2
countBlockers('')  // Returns: 0
```

## Status

✅ **FIXED** - Application should now load without errors

---

**Date:** October 21, 2025
**Error Type:** Type mismatch
**Impact:** App crashed on load when standups with blockers were present
**Resolution Time:** Immediate
