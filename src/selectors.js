// src/selectors.js
import { createSelector } from 're-reselect';

// Selectors to access items and filter state
const getItems = state => state.items; // Get items from the state
const getFilter = state => state.filter; // Get filter from the state

// Memoized selector to filter items based on the filter
export const getFilteredItems = createSelector(
  [getItems, getFilter], // Inputs: items and filter from the state
  (items, filter) => {
    // Return filtered items based on the filter condition
    return items.filter(item => item.name.includes(filter));
  }
);