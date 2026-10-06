const CLE_TOKEN = 'boutigest_sync_token';

export function getSyncToken() {
  return localStorage.getItem(CLE_TOKEN);
}

export function setSyncToken(token) {
  localStorage.setItem(CLE_TOKEN, token);
}

export function retirerSyncToken() {
  localStorage.removeItem(CLE_TOKEN);
}