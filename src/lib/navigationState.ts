// Tells entrance animations whether this render is the first page load (where
// the server HTML is already on screen, so replaying it would flash) or a
// client-side navigation (where the page arrives fresh and should animate).
let firstLoadDone = false

export function isFirstLoad(): boolean {
  return !firstLoadDone
}

export function markFirstLoadDone(): void {
  firstLoadDone = true
}
