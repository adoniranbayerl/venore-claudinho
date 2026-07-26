"use client";

// Store externo mínimo (useSyncExternalStore) para o estado aberto/fechado do drawer de
// navegação mobile — Header (hamburger) e SidebarLeft (drawer) são slots irmãos no layout
// (não há ancestral comum client-side pra um Context), então o estado vive fora da árvore
// React e cada lado assina via hook. Mantém HeaderSlot/SidebarLeftSlot como server components;
// só quem chama o hook precisa de "use client".
import { useSyncExternalStore } from "react";

let isOpen = false;
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return isOpen;
}

function getServerSnapshot() {
  return false;
}

export function openMobileNav() {
  isOpen = true;
  emitChange();
}

export function closeMobileNav() {
  isOpen = false;
  emitChange();
}

export function toggleMobileNav() {
  isOpen = !isOpen;
  emitChange();
}

export function useMobileNavOpen() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
