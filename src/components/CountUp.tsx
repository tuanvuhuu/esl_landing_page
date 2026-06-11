"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Đếm số tăng dần khi cuộn tới. Giữ nguyên phần chữ xung quanh số
 * (VD "2.000+", "8 năm", "99%", "≤ 10").
 */
export default function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = value.match(/^(\D*)([\d.,]+)(.*)$/s);
    if (!match) return; // không có số -> giữ nguyên
    const [, prefix, numStr, suffix] = match;
    const sep = numStr.includes(".") ? "." : numStr.includes(",") ? "," : "";
    const target = parseInt(numStr.replace(/[.,]/g, ""), 10);
    if (!Number.isFinite(target)) return;

    const fmt = (n: number) => {
      const s = sep ? n.toLocaleString("vi-VN").replace(/[.,]/g, sep) : String(n);
      return `${prefix}${s}${suffix}`;
    };

    if (!("IntersectionObserver" in window)) {
      setDisplay(fmt(target));
      return;
    }

    setDisplay(fmt(0));
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(fmt(Math.round(target * eased)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (run(), io.disconnect())),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
}
