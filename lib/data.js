/**
 * Supabase data layer — JS port of data.py.
 * All functions are server-only (used inside API route handlers).
 */
import { supabase } from './supabase';

// ─── Helpers ───

// Returns today's date in IST (Asia/Kolkata) as "YYYY-MM-DD"
function today() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date()); // en-CA locale formats as YYYY-MM-DD
}

// Converts any "YYYY-MM-DD" string or Date object into UTC midnight milliseconds for exact calendar day math
function toCalendarMidnight(val) {
  if (!val) return 0;
  if (typeof val === 'string') {
    const clean = val.slice(0, 10);
    const [y, m, d] = clean.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  }
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [y, m, d] = formatter.format(val).split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

// Exact number of calendar days between d1 and d2 (equivalent to (d2 - d1).days in Python)
function daysBetween(d1, d2) {
  const ms1 = toCalendarMidnight(d1);
  const ms2 = toCalendarMidnight(d2);
  return Math.round((ms2 - ms1) / (1000 * 60 * 60 * 24));
}

// Add integer days to "YYYY-MM-DD" string and return "YYYY-MM-DD"
function addDays(dateStr, days) {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  const year = next.getUTCFullYear();
  const month = String(next.getUTCMonth() + 1).padStart(2, '0');
  const day = String(next.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ─── LLM Cache ───

export async function getCachedLlm(key) {
  if (!supabase) return null;
  const { data } = await supabase.from('llm_cache').select('*').eq('category', key);
  if (data && data.length > 0) {
    const row = data[0];
    if (row.cached_date === today()) return row.data;
  }
  return null;
}

export async function setCachedLlm(key, llmData) {
  if (!supabase) return;
  await supabase.from('llm_cache').upsert({
    category: key,
    cached_date: today(),
    data: llmData,
  });
}

export async function clearCachedLlm(key) {
  if (!supabase) return;
  await supabase.from('llm_cache').delete().eq('category', key);
}

// ─── Analytics ───

export function analyzeHistory(datesList, label) {
  if (!datesList || datesList.length === 0) {
    return {
      total_count: 0, label, this_month: 0, last_month: 0,
      avg_gap_days: 0, longest_streak: 0, favorite_day: 'None',
      monthly_breakdown: {}, all_dates: [],
    };
  }
  const parsed = datesList
    .map((d) => {
      const clean = (typeof d === 'string' ? d : '').slice(0, 10);
      const [y, m, day] = clean.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, day));
    })
    .sort((a, b) => a - b);

  const todayStr = today();
  const [thisYear, thisMonthNum] = todayStr.split('-').map(Number);
  const thisMonth = thisMonthNum - 1;
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const thisMonthCount = parsed.filter(
    (d) => d.getUTCFullYear() === thisYear && d.getUTCMonth() === thisMonth
  ).length;
  const lastMonthCount = parsed.filter(
    (d) => d.getUTCFullYear() === lastMonthYear && d.getUTCMonth() === lastMonth
  ).length;

  const gaps = parsed.slice(1).map((d, i) => daysBetween(parsed[i], d));
  const avgGap = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 0;

  let longestStreak = parsed.length > 0 ? 1 : 0;
  let currentStreak = 1;
  for (let i = 1; i < parsed.length; i++) {
    if (daysBetween(parsed[i - 1], parsed[i]) === 1) {
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
    } else {
      currentStreak = 1;
    }
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = {};
  parsed.forEach((d) => {
    const name = dayNames[d.getUTCDay()];
    dayCounts[name] = (dayCounts[name] || 0) + 1;
  });
  const favDay = Object.keys(dayCounts).sort((a, b) => dayCounts[b] - dayCounts[a])[0] || 'None';

  const breakdown = {};
  parsed.forEach((d) => {
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    breakdown[key] = (breakdown[key] || 0) + 1;
  });

  return {
    total_count: parsed.length,
    label,
    this_month: thisMonthCount,
    last_month: lastMonthCount,
    avg_gap_days: avgGap,
    longest_streak: longestStreak,
    favorite_day: favDay,
    monthly_breakdown: breakdown,
    all_dates: parsed.map((d) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }).reverse(),
  };
}

// ─── Period ───

export async function getPeriodData() {
  if (!supabase) {
    return { last_period: '2026-03-31', next_period: '2026-04-26', cycle_length: 26, days_until: 0, days_since: 0 };
  }
  const { data } = await supabase.from('dates').select('*').eq('id', 1);
  const row = data[0];
  const lastPeriod = row.last_period;
  const cycleLength = row.cycle_length || 26;
  const nextPeriod = addDays(lastPeriod, cycleLength);
  const now = new Date();
  const daysUntil = daysBetween(now, nextPeriod);
  const daysSince = daysBetween(lastPeriod, now);
  return {
    last_period: row.last_period,
    next_period: nextPeriod,
    cycle_length: cycleLength,
    days_until: daysUntil,
    days_since: daysSince,
  };
}

export async function updatePeriod() {
  if (supabase) {
    await supabase.from('dates').update({ last_period: today() }).eq('id', 1);
  }
  return getPeriodData();
}

// ─── Last Met ───

export async function getLastMet() {
  if (!supabase) return { last_met: '2026-04-03', days_since: 0 };
  const { data } = await supabase.from('dates').select('last_met').eq('id', 1);
  const row = data[0];
  const daysSince = daysBetween(row.last_met, new Date());
  return { last_met: row.last_met, days_since: daysSince };
}

export async function updateLastMet() {
  if (supabase) {
    const t = today();
    await supabase.from('dates').update({ last_met: t }).eq('id', 1);
    try {
      await supabase.from('met_history').insert({ met_date: t });
    } catch { /* ignore duplicates */ }
  }
  return getLastMet();
}

export async function getMetInsights() {
  if (!supabase) return analyzeHistory([], 'Times Met');
  const { data } = await supabase.from('met_history').select('met_date');
  return analyzeHistory(data.map((r) => r.met_date), 'Times Met');
}

// ─── Last Special ───

export async function getLastSpecial() {
  if (!supabase) return { last_special: '2026-02-20', days_since: 0 };
  const { data } = await supabase.from('dates').select('last_special').eq('id', 1);
  const row = data[0];
  const daysSince = daysBetween(row.last_special, new Date());
  return { last_special: row.last_special, days_since: daysSince };
}

export async function updateLastSpecial() {
  if (supabase) {
    const t = today();
    await supabase.from('dates').update({ last_special: t }).eq('id', 1);
    try {
      await supabase.from('special_history').insert({ special_date: t });
    } catch { /* ignore duplicates */ }
  }
  return getLastSpecial();
}

export async function getSpecialInsights() {
  if (!supabase) return analyzeHistory([], 'Special Nights');
  const { data } = await supabase.from('special_history').select('special_date');
  return analyzeHistory(data.map((r) => r.special_date), 'Special Nights');
}


// ─── Places Wishlist ───

function emptyPlacesAnalytics() {
  return { total_visited: 0, total_pending: 0, this_month: 0, monthly_breakdown: {} };
}

function computePlacesAnalytics(completedRows) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  let thisMonthCount = 0;
  const breakdown = {};

  for (const r of completedRows) {
    if (!r.completed_at) continue;
    try {
      const d = new Date(r.completed_at);
      if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) thisMonthCount++;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      breakdown[key] = (breakdown[key] || 0) + 1;
    } catch { /* skip */ }
  }

  return {
    total_visited: completedRows.length,
    total_pending: 0,
    this_month: thisMonthCount,
    monthly_breakdown: Object.fromEntries(Object.entries(breakdown).sort()),
  };
}

export async function getPlaces() {
  if (!supabase) return { wishlist: [], history: [], analytics: emptyPlacesAnalytics() };

  const { data: active } = await supabase
    .from('places_wishlist')
    .select('*')
    .eq('completed', false)
    .order('created_at', { ascending: false });

  const { data: completed } = await supabase
    .from('places_wishlist')
    .select('*')
    .eq('completed', true)
    .order('completed_at', { ascending: false });

  const wishlist = active.map((r) => ({ id: r.id, place: r.place, notes: r.notes || '', created_at: r.created_at }));
  const history = completed.map((r) => ({ id: r.id, place: r.place, notes: r.notes || '', completed_at: r.completed_at || '' }));
  const analytics = computePlacesAnalytics(completed);
  analytics.total_pending = wishlist.length;

  return { wishlist, history, analytics };
}

export async function addPlace(place, notes = '') {
  if (supabase) {
    await supabase.from('places_wishlist').insert({ place, notes, completed: false });
  }
  return getPlaces();
}

export async function completePlace(id) {
  if (supabase) {
    await supabase
      .from('places_wishlist')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', id);
  }
  return getPlaces();
}

export async function deletePlace(id) {
  if (supabase) {
    await supabase.from('places_wishlist').delete().eq('id', id);
  }
  return getPlaces();
}
