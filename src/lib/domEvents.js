export function addEventListener (...args) {
  if (!document) return;

  document.addEventListener(...args);
}

export function removeEventListener (...args) {
  if (!document) return;

  document.removeEventListener(...args);
}
