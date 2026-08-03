// Utility to load section data from JSON files (editable via admin panel)
// Falls back to hardcoded constants if JSON load fails

const cache = {};

export async function loadSectionData(section) {
  if (cache[section]) return cache[section];

  try {
    const res = await fetch(`/data/${section}.json`);
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();
    cache[section] = data;
    return data;
  } catch {
    return null; // Fallback to constants
  }
}

export function clearCache() {
  Object.keys(cache).forEach((k) => delete cache[k]);
}
