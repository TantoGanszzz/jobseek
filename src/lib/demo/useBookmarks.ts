"use client";

import { useSyncExternalStore } from "react";

const KEY = "jobseek:bookmarks";
const EVENT = "jobseek:bookmarks";

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useBookmarks() {
  const saved = useSyncExternalStore(subscribe, read, () => []);

  function toggle(id: string) {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new Event(EVENT));
  }

  return { saved, toggle };
}