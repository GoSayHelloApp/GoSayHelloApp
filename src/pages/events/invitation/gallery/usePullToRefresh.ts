import { useEffect, useRef, useState } from "react";

// Lightweight pull-to-refresh for a scroll container (touch devices). When the user pulls
// down while scrolled to the top past a threshold, `onRefresh` runs; `pull`/`refreshing`
// drive a spinner indicator.
export function usePullToRefresh(
  scrollRef: React.RefObject<HTMLElement>,
  onRefresh: () => Promise<unknown> | void
) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const THRESHOLD = 64;
    const setP = (v: number) => {
      pullRef.current = v;
      setPull(v);
    };

    const onStart = (e: TouchEvent) => {
      startY.current = el.scrollTop <= 0 ? e.touches[0].clientY : null;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current == null || refreshingRef.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && el.scrollTop <= 0) setP(Math.min(dy * 0.5, 90));
      else if (dy <= 0) setP(0);
    };
    const onEnd = async () => {
      if (startY.current == null) return;
      startY.current = null;
      if (pullRef.current >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        setP(46);
        try {
          await onRefreshRef.current();
        } finally {
          refreshingRef.current = false;
          setRefreshing(false);
          setP(0);
        }
      } else {
        setP(0);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [scrollRef]);

  return { pull, refreshing };
}
