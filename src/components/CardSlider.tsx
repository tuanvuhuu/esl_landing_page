"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Khung slider cuộn ngang dùng chung (vuốt trái/phải). Nếu `autoMs` > 0 thì
 * tự trượt sau mỗi `autoMs` mili-giây, tạm dừng khi rê chuột.
 */
export default function CardSlider({
  className = "",
  autoMs = 0,
  children,
}: {
  className?: string;
  autoMs?: number;
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !autoMs) return;

    let paused = false;
    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);

    const startInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (paused) return;
        const first = track.firstElementChild as HTMLElement | null;
        if (!first) return;
        const styles = getComputedStyle(track);
        const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
        const step = first.offsetWidth + gap;
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll - 4) track.scrollTo({ left: 0, behavior: "smooth" });
        else track.scrollBy({ left: step, behavior: "smooth" });
      }, autoMs);
    };

    startInterval();
    (track as any).__resetSliderInterval = startInterval;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
    };
  }, [autoMs]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const card = (e.target as HTMLElement).closest(".card-slider > *") as HTMLElement | null;
    
    if (card && track.contains(card)) {
      // Reset the auto-slide timer so it doesn't auto-scroll right after user interaction
      if ((track as any).__resetSliderInterval) {
        (track as any).__resetSliderInterval();
      }

      const trackRect = track.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const cardWidth = card.offsetWidth;
      const trackWidth = track.clientWidth;
      
      const relativeCardLeft = cardRect.left - trackRect.left + track.scrollLeft;

      let targetScroll: number | null = null;

      // 16px padding for better visual spacing
      if (cardRect.left < trackRect.left) {
        targetScroll = Math.max(0, relativeCardLeft - 16);
      } else if (cardRect.right > trackRect.right) {
        targetScroll = relativeCardLeft + cardWidth - trackWidth + 16;
      }

      if (targetScroll !== null) {
        // Temporarily disable scroll snapping during smooth scroll to prevent snap interference
        track.style.scrollSnapType = "none";
        
        let restored = false;
        const restoreSnap = () => {
          if (restored) return;
          restored = true;
          track.style.scrollSnapType = "";
          track.removeEventListener("scrollend", restoreSnap);
        };
        
        track.addEventListener("scrollend", restoreSnap);
        setTimeout(restoreSnap, 600); // 600ms safety fallback
        
        track.scrollTo({ left: targetScroll, behavior: "smooth" });
      }
    }
  };

  return (
    <div className={`card-slider ${className}`} ref={trackRef} onClick={handleClick}>
      {children}
    </div>
  );
}
