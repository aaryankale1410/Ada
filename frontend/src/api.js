/**
 * API client for the couple's website backend.
 */

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`API call failed: ${url}`, err);
    throw err;
  }
}

// Open When
export const getOpenWhen = (category) => fetchJSON(`/open-when/${category}`, { cache: 'no-store' });

// Period
export const getPeriod = () => fetchJSON('/period');
export const updatePeriod = () => fetchJSON('/period/update', { method: 'POST' });

// Last Met
export const getLastMet = () => fetchJSON('/last-met');
export const updateLastMet = () => fetchJSON('/last-met/update', { method: 'POST' });
export const getMetInsights = () => fetchJSON('/last-met/insights');

// Last Special
export const getLastSpecial = () => fetchJSON('/last-special');
export const updateLastSpecial = () => fetchJSON('/last-special/update', { method: 'POST' });
export const getSpecialInsights = () => fetchJSON('/last-special/insights');

// Food
export const getFoodSuggestion = () => fetchJSON('/food/suggest');
export const getFoodHistory = () => fetchJSON('/food/history');
export const addFood = (items) => fetchJSON('/food/add', {
  method: 'POST',
  body: JSON.stringify({ items }),
});

// Places Wishlist
export const getPlaces = () => fetchJSON('/places');
export const addPlace = (place, notes) => fetchJSON('/places/add', {
  method: 'POST',
  body: JSON.stringify({ place, notes }),
});
export const completePlace = (id) => fetchJSON('/places/complete', {
  method: 'POST',
  body: JSON.stringify({ id }),
});
export const deletePlace = (id) => fetchJSON('/places/delete', {
  method: 'POST',
  body: JSON.stringify({ id }),
});
