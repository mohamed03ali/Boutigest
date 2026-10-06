const CLE_DERNIERE_SYNC = 'boutigest_derniere_sync';

export function getDerniereSync() {
  return localStorage.getItem(CLE_DERNIERE_SYNC) || '1970-01-01T00:00:00.000Z';
}

export function setDerniereSync(date) {
  localStorage.setItem(CLE_DERNIERE_SYNC, date);
}