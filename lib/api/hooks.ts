"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, onInvalidate } from "./client";
import type { ApiError } from "./types";

type Q<T> = { data: T | undefined; error: ApiError | undefined; loading: boolean; refresh: () => void };

/** Runs `fn` on mount, when `deps` change, after any mutation, and every `pollMs` if given. */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = [], pollMs?: number): Q<T> {
  const [state, setState] = useState<Omit<Q<T>, "refresh">>({ data: undefined, error: undefined, loading: true });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(() => {
    fnRef.current().then(
      (data) => setState({ data, error: undefined, loading: false }),
      (error) => setState((s) => ({ ...s, error, loading: false })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    run();
    const off = onInvalidate(run);
    const iv = pollMs ? setInterval(run, pollMs) : undefined;
    return () => {
      off();
      if (iv) clearInterval(iv);
    };
  }, [run, pollMs]);
  return { ...state, refresh: run };
}

export const useMe = () => useQuery(() => api.me.get());
