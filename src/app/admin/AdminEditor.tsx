"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent, Testimonial, FaqItem, Stat, Feature, ChatTopic, Branch, WheelPrize, SocialProofItem } from "@/lib/content";
import { Btn, BtnDel, BtnAdd, TextInput, TextArea, SelectInput, FileUpload, DateInput, ToastProvider, useToast } from "./ui";
import "./admin.css";

type Lead = {
  id: number;
  name: string;
  phone: string;
  ageGroup: string;
  status: string;
  utmSource: string;
  utmCampaign: string;
  eventId: number | null;
  site: string;
  createdAt: string;
};

type EventItem = {
  id: number;
  title: string;
  description: string;
  image: string;
  images: string; // JSON array of additional image URLs
  date: string;
  endDate: string | null;
  location: string;
  ctaText: string;
  ctaLink: string;
  status: string;
  template: string;
};

const EMPTY_EVENT: Omit<EventItem, "id"> = {
  title: "", description: "", image: "", images: "[]", date: "", endDate: null,
  location: "", ctaText: "Đăng ký tham gia", ctaLink: "#signup", status: "draft",
  template: "default",
};

const STATUSES: { value: string; label: string }[] = [
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã gọi" },
  { value: "trial", label: "Đã học thử" },
  { value: "enrolled", label: "Đã ghi danh" },
  { value: "lost", label: "Không quan tâm" },
];

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Upload thất bại");
  }
  return data.url as string;
}

function AdminEditorInner({ initial, initialSite }: { initial: SiteContent; initialSite: string }) {
  const router = useRouter();
  const [c, setC] = useState<SiteContent>(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  // Multi-site: site đang chỉnh + danh sách site + ô tạo site mới
  const [activeSite, setActiveSite] = useState(initialSite);
  const [sites, setSites] = useState<{ site: string; leadCount: number }[]>([]);
  const [newSiteKey, setNewSiteKey] = useState("");
  const [leadSiteFilter, setLeadSiteFilter] = useState("all");
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isDirty = useRef(false);

  // Events state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingEvent, setEditingEvent] = useState<(Omit<EventItem, "id"> & { id?: number }) | null>(null);
  const [eventSaving, setEventSaving] = useState(false);
  // Popup "Link quảng cáo" cho 1 sự kiện
  const [linkEvent, setLinkEvent] = useState<EventItem | null>(null);
  const [linkCampaign, setLinkCampaign] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // New feature states
  const [leadSearch, setLeadSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState("all");
  const [leadEventFilter, setLeadEventFilter] = useState("all"); // "all" | "none" | "<eventId>"
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [darkMode, setDarkMode] = useState(false);

  // Device preview mode
  type PreviewDevice = "desktop" | "tablet" | "mobile";
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const PREVIEW_WIDTHS: Record<PreviewDevice, string> = { desktop: "100%", tablet: "768px", mobile: "375px" };

  // Lead polling
  const prevLeadCount = useRef(0);

  const CONTENT_TABS = ["hero", "programs", "reviews", "faq", "contact", "chatbot", "marketing"];

  const TABS = [
    { id: "dashboard", icon: "📊", label: "Tổng quan" },
    { id: "hero", icon: "🏠", label: "Trang chủ" },
    { id: "programs", icon: "📚", label: "Chương trình" },
    { id: "reviews", icon: "⭐", label: "Đánh giá" },
    { id: "faq", icon: "❓", label: "FAQ & Ưu đãi" },
    { id: "contact", icon: "📞", label: "Liên hệ" },
    { id: "chatbot", icon: "🤖", label: "Chatbot" },
    { id: "marketing", icon: "🎡", label: "Vòng quay & Thông báo" },
    { id: "events", icon: "🎉", label: "Sự kiện", badge: events.length },
    { id: "leads", icon: "👥", label: "Khách hàng", badge: leads.length },
  ];

  // Tra tên sự kiện theo id
  const eventTitleById = new Map(events.map((e) => [e.id, e.title]));
  // Các sự kiện đang có khách đăng ký (kèm số lượng) để hiện trong bộ lọc
  const eventLeadCounts = leads.reduce<Record<number, number>>((acc, l) => {
    if (l.eventId != null) acc[l.eventId] = (acc[l.eventId] ?? 0) + 1;
    return acc;
  }, {});
  const noEventCount = leads.filter((l) => l.eventId == null).length;

  // Các site đang có khách đăng ký (để lọc "gom lead 1 chỗ")
  const siteLeadCounts = leads.reduce<Record<string, number>>((acc, l) => {
    const s = l.site || "default";
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  // Filtered leads
  const filteredLeads = leads.filter((l) => {
    if (leadSiteFilter !== "all" && (l.site || "default") !== leadSiteFilter) return false;
    if (leadFilter !== "all" && (l.status || "new") !== leadFilter) return false;
    if (leadEventFilter !== "all") {
      if (leadEventFilter === "none") {
        if (l.eventId != null) return false;
      } else if (String(l.eventId ?? "") !== leadEventFilter) {
        return false;
      }
    }
    if (leadSearch) {
      const q = leadSearch.toLowerCase();
      return l.name.toLowerCase().includes(q) || l.phone.includes(q);
    }
    return true;
  });

  // Dashboard stats
  const dashStats = {
    totalLeads: leads.length,
    newToday: leads.filter((l) => {
      const d = new Date(l.createdAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length,
    byStatus: STATUSES.map((s) => ({
      ...s,
      count: leads.filter((l) => (l.status || "new") === s.value).length,
    })),
    totalEvents: events.length,
    activeEvents: events.filter((e) => e.status === "published").length,
  };

  // Sparkline: leads per day for last 7 days
  const leadsByDay = (() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      const label = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      const count = leads.filter((l) => new Date(l.createdAt).toDateString() === ds).length;
      days.push({ label, count });
    }
    return days;
  })();

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Lead[]) => { setLeads(data); prevLeadCount.current = data.length; })
      .catch(() => setLeads([]));
    loadEvents(initialSite);
    loadSites();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadSites() {
    try {
      const res = await fetch("/api/sites");
      if (res.ok) setSites(await res.json());
    } catch { /* ignore */ }
  }

  // Chuyển sang chỉnh nội dung/sự kiện của site khác
  async function switchSite(site: string) {
    if (site === activeSite) return;
    if (isDirty.current && !confirm("Bạn có thay đổi chưa lưu. Chuyển site sẽ mất. Tiếp tục?")) return;
    try {
      const res = await fetch(`/api/content?site=${encodeURIComponent(site)}`);
      if (res.ok) {
        setC(await res.json());
        isDirty.current = false;
        setSaved(false);
      }
    } catch { toast("Không tải được nội dung site", "error"); }
    setActiveSite(site);
    loadEvents(site);
  }

  async function addSite() {
    const key = newSiteKey.trim().toLowerCase();
    if (!key) return;
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site: key }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast(data.error || "Tạo site thất bại", "error"); return; }
      setNewSiteKey("");
      await loadSites();
      toast(`Đã tạo site "${key}"`, "success");
      switchSite(key);
    } catch { toast("Tạo site thất bại", "error"); }
  }

  // Poll for new leads every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/leads");
        if (!res.ok) return;
        const data: Lead[] = await res.json();
        if (data.length > prevLeadCount.current && prevLeadCount.current > 0) {
          const newCount = data.length - prevLeadCount.current;
          toast(`🔔 Có ${newCount} khách mới đăng ký!`, "info");
        }
        prevLeadCount.current = data.length;
        setLeads(data);
      } catch { /* ignore */ }
    }, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Bỏ dấu tiếng Việt + tạo slug cho utm_campaign
  function slugify(s: string): string {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  }

  // Dựng link sự kiện kèm UTM theo kênh (dùng đúng domain đang mở)
  function buildEventLink(ev: EventItem, source?: string, campaign?: string): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const base = `${origin}/su-kien/${ev.id}`;
    if (!source) return base;
    const camp = (campaign || "").trim() || `su-kien-${ev.id}`;
    const params = new URLSearchParams({
      utm_source: source,
      utm_medium: "cpc",
      utm_campaign: camp,
    });
    return `${base}?${params.toString()}`;
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast(`📋 Đã copy link ${label}`, "success");
    } catch {
      toast("Trình duyệt chặn copy — hãy bôi đen link rồi copy thủ công", "error");
    }
  }

  async function loadEvents(site: string = activeSite) {
    try {
      const res = await fetch(`/api/events?all=1&site=${encodeURIComponent(site)}`);
      if (res.ok) setEvents(await res.json());
    } catch { /* ignore */ }
  }

  async function saveEvent() {
    if (!editingEvent || !editingEvent.title || !editingEvent.date) {
      alert("Vui lòng nhập tiêu đề và ngày diễn ra");
      return;
    }
    setEventSaving(true);
    try {
      const method = editingEvent.id ? "PUT" : "POST";
      const body = editingEvent.id
        ? editingEvent
        : { ...editingEvent, site: activeSite };
      const res = await fetch("/api/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      setEditingEvent(null);
      await loadEvents();
    } catch {
      alert("Lưu sự kiện thất bại");
    } finally {
      setEventSaving(false);
    }
  }

  async function deleteEvent(id: number) {
    if (!confirm("Xóa sự kiện này?")) return;
    await fetch("/api/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await loadEvents();
  }

  async function toggleEvent(ev: EventItem) {
    if (ev.status === "cancelled") return; // sự kiện đã huỷ: chỉnh trong popup
    const next = ev.status === "published" ? "draft" : "published";
    // Cập nhật lạc quan để UI phản hồi ngay
    setEvents((prev) => prev.map((e) => (e.id === ev.id ? { ...e, status: next } : e)));
    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ev.id, status: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      alert("Không đổi được trạng thái");
      await loadEvents(); // hoàn tác bằng cách tải lại
    }
  }

  async function uploadEventImage(file: File) {
    try {
      const url = await uploadFile(file);
      setEditingEvent((prev) => prev ? { ...prev, image: url } : prev);
    } catch (err) {
      alert(`Lỗi upload ảnh: ${err instanceof Error ? err.message : "Không xác định"}`);
    }
  }

  async function uploadEventExtraImage(file: File) {
    try {
      const url = await uploadFile(file);
      setEditingEvent((prev) => {
        if (!prev) return prev;
        const arr: string[] = JSON.parse(prev.images || "[]");
        return { ...prev, images: JSON.stringify([...arr, url]) };
      });
    } catch (err) {
      alert(`Lỗi upload ảnh: ${err instanceof Error ? err.message : "Không xác định"}`);
    }
  }

  function removeEventExtraImage(idx: number) {
    setEditingEvent((prev) => {
      if (!prev) return prev;
      const arr: string[] = JSON.parse(prev.images || "[]");
      arr.splice(idx, 1);
      return { ...prev, images: JSON.stringify(arr) };
    });
  }

  function patch(updater: (draft: SiteContent) => void) {
    setC((prev) => {
      const next = structuredClone(prev);
      updater(next);
      return next;
    });
    setSaved(false);
    isDirty.current = true;
  }

  // Move item up/down in array
  function moveItem<T>(arr: T[], from: number, to: number): T[] {
    if (to < 0 || to >= arr.length) return arr;
    const clone = [...arr];
    const [item] = clone.splice(from, 1);
    clone.splice(to, 0, item);
    return clone;
  }

  // Collapsible card toggle
  function toggleCard(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const { toast } = useToast();

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site: activeSite, ...c }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      isDirty.current = false;
      toast("Đã lưu thành công!", "success");
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
    } catch {
      toast("Lưu thất bại. Bạn đã đăng nhập chưa?", "error");
    } finally {
      setSaving(false);
    }
  }

  // Warn on page leave with unsaved changes
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty.current) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Tab switch with unsaved changes warning
  function switchTab(id: string) {
    if (isDirty.current && CONTENT_TABS.includes(activeTab)) {
      if (!confirm("Bạn có thay đổi chưa lưu. Chuyển tab sẽ mất dữ liệu. Tiếp tục?")) return;
    }
    setActiveTab(id);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function exportCSV() {
    const headers = ["Site", "Tên", "SĐT", "Độ tuổi", "Sự kiện", "Nguồn", "Campaign", "Trạng thái", "Thời gian"];
    const rows = leads.map((l) => [
      l.site || "default",
      l.name, l.phone, l.ageGroup || "",
      l.eventId != null ? (eventTitleById.get(l.eventId) ?? `Sự kiện #${l.eventId}`) : "",
      l.utmSource || "", l.utmCampaign || "",
      STATUSES.find((s) => s.value === (l.status || "new"))?.label ?? l.status,
      new Date(l.createdAt).toLocaleString("vi-VN"),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function updateStatus(id: number, status: string) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      alert("Cập nhật trạng thái thất bại.");
    }
  }

  async function onAddGalleryMultiple(files: FileList) {
    setGalleryUploading(true);
    const total = files.length;
    try {
      for (let i = 0; i < total; i++) {
        setGalleryProgress(`Đang tải ${i + 1}/${total}...`);
        const url = await uploadFile(files[i]);
        patch((d) => { d.gallery.push(url); });
      }
      setGalleryProgress(`✓ Đã tải ${total} ảnh`);
      setTimeout(() => setGalleryProgress(""), 2500);
    } catch {
      alert("Có lỗi khi tải ảnh lên, vui lòng thử lại.");
      setGalleryProgress("");
    } finally {
      setGalleryUploading(false);
    }
  }

  async function onHeroImage(file: File) {
    const url = await uploadFile(file);
    patch((d) => {
      d.hero.image = url;
    });
  }

  return (
    <div className={`admin${darkMode ? " dark" : ""}`}>
      <div className="admin-editor">
      <div className="admin-top">
        <div>
          <h1>Quản trị nội dung</h1>
          <p className="muted">Sửa nội dung, lưu lại là trang công khai cập nhật ngay.</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <button className="abtn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Sáng" : "Tối"} style={{ padding: "0.4rem 0.7rem" }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          <a className="abtn" href="/" target="_blank" rel="noreferrer">Xem trang ↗</a>
          <Btn onClick={logout}>Đăng xuất</Btn>
        </div>
      </div>

      {/* Thanh chọn site (nhiều site dùng chung 1 DB) */}
      <div className="site-bar">
        <span className="site-bar-label">🌐 Site đang chỉnh:</span>
        <select
          className="site-bar-select"
          value={activeSite}
          onChange={(e) => switchSite(e.target.value)}
          title="Chọn site để sửa nội dung & sự kiện"
        >
          {(sites.length ? sites.map((s) => s.site) : [activeSite]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="site-bar-add">
          <input
            value={newSiteKey}
            onChange={(e) => setNewSiteKey(e.target.value)}
            placeholder="mã-site-moi"
            onKeyDown={(e) => { if (e.key === "Enter") addSite(); }}
          />
          <button className="abtn abtn-add" onClick={addSite} title="Tạo site mới">＋ Thêm site</button>
        </span>
        <span className="site-bar-hint muted">Nội dung, sự kiện và khách đăng ký được tách riêng theo từng site.</span>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`admin-tab${activeTab === t.id ? " active" : ""}`} onClick={() => switchTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
            {t.badge ? <span className="tab-badge">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
      <div className="dashboard">
        <div className="dash-welcome">
          <h2>👋 Xin chào! Đây là tổng quan trung tâm <strong>{c.centerName}</strong></h2>
        </div>

        <div className="dash-grid">
          <div className="dash-card dc-green">
            <div className="dash-icon">👥</div>
            <div className="dash-num">{dashStats.totalLeads}</div>
            <div className="dash-label">Tổng khách đăng ký</div>
          </div>
          <div className="dash-card dc-orange">
            <div className="dash-icon">🔥</div>
            <div className="dash-num">{dashStats.newToday}</div>
            <div className="dash-label">Mới hôm nay</div>
          </div>
          <div className="dash-card dc-blue">
            <div className="dash-icon">🎉</div>
            <div className="dash-num">{dashStats.totalEvents}</div>
            <div className="dash-label">Sự kiện</div>
          </div>
          <div className="dash-card dc-purple">
            <div className="dash-icon">✅</div>
            <div className="dash-num">{dashStats.activeEvents}</div>
            <div className="dash-label">Đang hoạt động</div>
          </div>
        </div>

        <div className="dash-row">
          <div className="card dash-status-card">
            <h2>📊 Phễu khách hàng</h2>
            <div className="dash-funnel">
              {dashStats.byStatus.map((s) => {
                const pct = dashStats.totalLeads > 0 ? Math.round((s.count / dashStats.totalLeads) * 100) : 0;
                return (
                  <div
                    key={s.value}
                    className="dash-funnel-row"
                    onClick={() => {
                      setLeadFilter(s.value);
                      switchTab("leads");
                    }}
                    style={{ cursor: "pointer" }}
                    title={`Xem danh sách khách hàng ${s.label}`}
                  >
                    <span className="df-label">{s.label}</span>
                    <div className="df-bar-wrap">
                      <div className="df-bar" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                    <span className="df-count">{s.count}</span>
                    <span className="df-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card dash-actions-card">
            <h2>⚡ Truy cập nhanh</h2>
            <div className="dash-actions">
              <button className="dash-action-btn" onClick={() => switchTab("hero")}>🏠 Sửa trang chủ</button>
              <button className="dash-action-btn" onClick={() => switchTab("programs")}>📚 Chương trình</button>
              <button className="dash-action-btn" onClick={() => switchTab("leads")}>👥 Xem khách hàng</button>
              <button className="dash-action-btn" onClick={() => switchTab("events")}>🎉 Quản lý sự kiện</button>
              <button className="dash-action-btn" onClick={() => switchTab("chatbot")}>🤖 Cài chatbot</button>
              <button className="dash-action-btn" onClick={() => switchTab("faq")}>❓ FAQ & Ưu đãi</button>
            </div>
          </div>
        </div>

        {/* Sparkline chart */}
        <div className="card" style={{ marginTop: "1rem" }}>
          <h2>📈 Đăng ký 7 ngày qua</h2>
          <div className="sparkline-wrap">
            <svg viewBox="0 0 280 80" className="sparkline-svg">
              {(() => {
                const max = Math.max(...leadsByDay.map((d) => d.count), 1);
                const points = leadsByDay.map((d, i) => ({
                  x: 20 + i * 40,
                  y: 70 - (d.count / max) * 55,
                }));
                const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
                const area = `${line} L${points[points.length - 1].x},70 L${points[0].x},70 Z`;
                return (
                  <>
                    <defs>
                      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#80B848" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#80B848" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d={area} fill="url(#sparkGrad)" />
                    <path d={line} fill="none" stroke="#80B848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#80B848" strokeWidth="2" />
                        <text x={p.x} y={75} textAnchor="middle" fontSize="8" fill="#6b6480" fontWeight="600">{leadsByDay[i].label}</text>
                        {leadsByDay[i].count > 0 && (
                          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fill="#5F8F2E" fontWeight="800">{leadsByDay[i].count}</text>
                        )}
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      </div>
      )}

      {activeTab === "hero" && (<>
      <div className="card">
        <h2>Thông tin chung</h2>
        <div className="afield">
          <label>Tên trung tâm</label>
          <input value={c.centerName} onChange={(e) => patch((d) => { d.centerName = e.target.value; })} />
        </div>
      </div>

      <div className="card">
        <h2>Đầu trang (Hero)</h2>
        <div className="afield">
          <label>Badge thông báo nhỏ (eyebrow)</label>
          <input value={c.hero.eyebrow ?? ""} onChange={(e) => patch((d) => { d.hero.eyebrow = e.target.value; })} placeholder="🎓 Đang nhận học viên kỳ mới" />
        </div>
        <div className="afield">
          <label>Tiêu đề chính</label>
          <input value={c.hero.title} onChange={(e) => patch((d) => { d.hero.title = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Mô tả ngắn</label>
          <textarea value={c.hero.subtitle} onChange={(e) => patch((d) => { d.hero.subtitle = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Chữ trên nút kêu gọi</label>
          <input value={c.hero.ctaText} onChange={(e) => patch((d) => { d.hero.ctaText = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Ảnh đầu trang</label>
          <div className="thumbs">
            {c.hero.image && <img className="thumb" src={c.hero.image} alt="hero" />}
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onHeroImage(f); }} />
            {c.hero.image && (
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.hero.image = ""; })} title="Xóa ảnh">🗑 Xóa</button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Nhãn nổi quanh ảnh đầu trang ({(c.heroChips ?? []).length})</h2>
        <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          💡 Đây là các thẻ nhỏ nổi quanh logo/ảnh ở đầu trang (VD: &quot;Giáo viên bản ngữ&quot;, &quot;Lớp ≤ 10 bé&quot;). Chọn màu chấm tròn và nhập chữ. Nên để 2–4 thẻ cho cân đối.
        </p>
        {(c.heroChips ?? []).map((chip, i) => (
          <div key={i} className="item-header" style={{ marginTop: i ? "0.6rem" : 0 }}>
            <div className="afield" style={{ flex: "0 0 64px", marginBottom: 0 }}>
              <label>Màu chấm</label>
              <input type="color" value={chip.color || "#80B848"} onChange={(e) => patch((d) => { d.heroChips[i].color = e.target.value; })} style={{ width: "100%", height: 38, padding: 2, cursor: "pointer" }} />
            </div>
            <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
              <label>Chữ hiển thị</label>
              <input value={chip.label} onChange={(e) => patch((d) => { d.heroChips[i].label = e.target.value; })} placeholder="VD: Giáo viên bản ngữ" />
            </div>
            <button className="abtn abtn-del" onClick={() => patch((d) => { d.heroChips.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.heroChips = d.heroChips ?? []; d.heroChips.push({ label: "", color: "#80B848" }); })}>＋ Thêm nhãn</button>
      </div>

      <div className="card">
        <h2>Số liệu nổi bật ({(c.stats ?? []).length})</h2>
        <div className="row2" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {(c.stats ?? []).map((s: Stat, i: number) => (
            <div key={i} className="item-header">
              <div className="afield" style={{ flex: "0 0 90px", marginBottom: 0 }}>
                <label>Con số</label>
                <input value={s.num} onChange={(e) => patch((d) => { d.stats[i].num = e.target.value; })} placeholder="VD: 2.000+" />
              </div>
              <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
                <label>Nhãn</label>
                <input value={s.lbl} onChange={(e) => patch((d) => { d.stats[i].lbl = e.target.value; })} placeholder="VD: Học viên" />
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.stats.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
          ))}
        </div>
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.stats = d.stats ?? []; d.stats.push({ num: "", lbl: "" }); })}>＋ Thêm mới</button>
      </div>

      <div className="card">
        <h2>Vì sao chọn chúng tôi ({(c.features ?? []).length} điểm nổi bật)</h2>
        {(c.features ?? []).map((f: Feature, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="item-header">
              <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
                <label>Tiêu đề điểm {i + 1}</label>
                <input value={f.title} onChange={(e) => patch((d) => { d.features[i].title = e.target.value; })} />
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.features.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
            <div className="afield" style={{ marginTop: "0.6rem" }}>
              <label>Mô tả</label>
              <textarea value={f.desc} onChange={(e) => patch((d) => { d.features[i].desc = e.target.value; })} />
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.features = d.features ?? []; d.features.push({ title: "", desc: "" }); })}>＋ Thêm mới</button>
      </div>
      </>)}

      {activeTab === "programs" && (<>
      <div className="card">
        <h2>Chương trình học</h2>
        {c.programs.map((p, i) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="item-header">
              <div className="row2" style={{ flex: 1 }}>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Độ tuổi</label>
                  <input value={p.age} onChange={(e) => patch((d) => { d.programs[i].age = e.target.value; })} />
                </div>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Tên chương trình</label>
                  <input value={p.title} onChange={(e) => patch((d) => { d.programs[i].title = e.target.value; })} />
                </div>
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.programs.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
            <div className="afield" style={{ marginTop: "0.6rem" }}>
              <label>Mô tả</label>
              <textarea value={p.desc} onChange={(e) => patch((d) => { d.programs[i].desc = e.target.value; })} />
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.programs.push({ age: "", title: "", desc: "" }); })}>＋ Thêm mới</button>
      </div>
      </>)}

      {activeTab === "reviews" && (<>
      <div className="card">
        <h2>Đánh giá phụ huynh ({c.testimonials?.length || 0})</h2>
        <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          💡 Nhập đúng tên & lời đánh giá thật. Đính kèm ảnh feedback (ảnh chụp tin nhắn/đánh giá) — ảnh sẽ hiện cùng comment, khách bấm vào để xem rõ.
        </p>
        {(c.testimonials ?? []).map((t: Testimonial, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="item-header">
              <div className="row2" style={{ flex: 1 }}>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Tên phụ huynh</label>
                  <input value={t.name} onChange={(e) => patch((d) => { d.testimonials[i].name = e.target.value; })} />
                </div>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Vai trò (VD: Mẹ của bé 5 tuổi)</label>
                  <input value={t.role} onChange={(e) => patch((d) => { d.testimonials[i].role = e.target.value; })} />
                </div>
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.testimonials.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
            <div className="afield">
              <label>Nội dung đánh giá</label>
              <textarea value={t.text} onChange={(e) => patch((d) => { d.testimonials[i].text = e.target.value; })} />
            </div>
            <div className="row2">
              <div className="afield">
                <label>Số sao</label>
                <select value={t.rating} onChange={(e) => patch((d) => { d.testimonials[i].rating = Number(e.target.value); })}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} sao {"★".repeat(n)}</option>
                  ))}
                </select>
              </div>
              <div className="afield">
                <label>Ảnh feedback (tùy chọn — bấm để xem to)</label>
                <div className="thumbs">
                  {t.avatar && <img className="thumb" src={t.avatar} alt={t.name} />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await uploadFile(f);
                      patch((d) => { d.testimonials[i].avatar = url; });
                    }}
                  />
                  {t.avatar && (
                    <button className="abtn abtn-del" onClick={() => patch((d) => { d.testimonials[i].avatar = ""; })} title="Xóa ảnh">🗑</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.testimonials = d.testimonials ?? []; d.testimonials.push({ name: "", role: "", text: "", rating: 5, avatar: "" }); })}>＋ Thêm mới</button>
      </div>

      <div className="card">
        <h2>Thư viện ảnh lớp học</h2>
        {c.gallery.length > 0 && (
          <div className="thumbs" style={{ marginBottom: "1rem" }}>
            {c.gallery.map((src, i) => (
              <span key={i} style={{ position: "relative", display: "inline-block" }}>
                <img className="thumb" src={src} alt={`gallery ${i}`} />
                <button
                  className="abtn"
                  style={{ position: "absolute", top: -6, right: -6, padding: "0 5px", fontSize: "0.75rem", lineHeight: "1.4", borderRadius: "50%", background: "#e24f4f", color: "#fff", border: "none", cursor: "pointer" }}
                  onClick={() => patch((d) => { d.gallery.splice(i, 1); })}
                  title="Xóa ảnh này"
                >✕</button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
          <label className="abtn" style={{ cursor: galleryUploading ? "not-allowed" : "pointer", opacity: galleryUploading ? 0.6 : 1 }}>
            📷 Chọn ảnh (có thể chọn nhiều)
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={galleryUploading}
              style={{ display: "none" }}
              onChange={(e) => { if (e.target.files?.length) onAddGalleryMultiple(e.target.files); }}
            />
          </label>
          {galleryProgress && <span className="muted">{galleryProgress}</span>}
        </div>
        <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>
          Giữ Ctrl (Windows) hoặc ⌘ (Mac) để chọn nhiều ảnh cùng lúc.
        </p>
      </div>
      </>)}

      {activeTab === "faq" && (<>
      <div className="card">
        <h2>Câu hỏi thường gặp (FAQ)</h2>
        {(c.faq ?? []).map((item: FaqItem, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="item-header">
              <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
                <label>Câu hỏi</label>
                <input value={item.q} onChange={(e) => patch((d) => { d.faq[i].q = e.target.value; })} />
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.faq.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
            <div className="afield" style={{ marginTop: "0.6rem" }}>
              <label>Câu trả lời</label>
              <textarea value={item.a} onChange={(e) => patch((d) => { d.faq[i].a = e.target.value; })} />
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.faq = d.faq ?? []; d.faq.push({ q: "", a: "" }); })}>＋ Thêm mới</button>
      </div>

      <div className="card">
        <h2>Ưu đãi</h2>
        <div className="afield">
          <label>Tiêu đề ưu đãi</label>
          <input value={c.promo.title} onChange={(e) => patch((d) => { d.promo.title = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Mô tả ưu đãi</label>
          <textarea value={c.promo.desc} onChange={(e) => patch((d) => { d.promo.desc = e.target.value; })} />
        </div>
      </div>
      </>)}

      {activeTab === "contact" && (<>
      <div className="card">
        <h2>Liên hệ</h2>
        <div className="row2">
          <div className="afield">
            <label>Số điện thoại</label>
            <input value={c.contact.phone} onChange={(e) => patch((d) => { d.contact.phone = e.target.value; })} />
          </div>
          <div className="afield">
            <label>Email</label>
            <input value={c.contact.email} onChange={(e) => patch((d) => { d.contact.email = e.target.value; })} />
          </div>
        </div>
        <div className="afield">
          <label>Địa chỉ</label>
          <input value={c.contact.address} onChange={(e) => patch((d) => { d.contact.address = e.target.value; })} />
        </div>
        <div className="row2">
          <div className="afield">
            <label>Link Zalo (để trống nếu không dùng)</label>
            <input value={c.contact.zalo ?? ""} placeholder="https://zalo.me/0900000000" onChange={(e) => patch((d) => { d.contact.zalo = e.target.value; })} />
          </div>
          <div className="afield">
            <label>Link Messenger</label>
            <input value={c.contact.messenger ?? ""} placeholder="https://m.me/trangcuaban" onChange={(e) => patch((d) => { d.contact.messenger = e.target.value; })} />
          </div>
        </div>
        <div className="afield">
          <label>Link Facebook Page</label>
          <input value={c.contact.facebook ?? ""} placeholder="https://facebook.com/trangcuaban" onChange={(e) => patch((d) => { d.contact.facebook = e.target.value; })} />
        </div>
        <div className="row2">
          <div className="afield">
            <label>Facebook Page ID (Messenger chat plugin)</label>
            <input value={c.contact.fbPageId ?? ""} placeholder="VD: 123456789012345" onChange={(e) => patch((d) => { d.contact.fbPageId = e.target.value; })} />
            <small style={{ color: "#6b6480", fontSize: "0.8rem" }}>Vào Facebook Page → Settings → Page Info → Page ID</small>
          </div>
          <div className="afield">
            <label>Zalo OA ID (Zalo chat widget)</label>
            <input value={c.contact.zaloOAId ?? ""} placeholder="VD: 1234567890123456" onChange={(e) => patch((d) => { d.contact.zaloOAId = e.target.value; })} />
            <small style={{ color: "#6b6480", fontSize: "0.8rem" }}>Vào Zalo Official Account Manager → OA ID</small>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>🏢 Cơ sở ({(c.branches ?? []).length})</h2>
        <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          💡 Thêm các cơ sở của trung tâm. Mỗi cơ sở sẽ hiện trên trang chủ với bản đồ.
          Để lấy link bản đồ: vào Google Maps → tìm địa chỉ → bấm &quot;Chia sẻ&quot; → &quot;Nhúng bản đồ&quot; → copy link trong thẻ iframe (phần src=&quot;...&quot;).
        </p>
        {(c.branches ?? []).map((b: Branch, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="item-header">
              <div className="row2" style={{ flex: 1 }}>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Tên cơ sở</label>
                  <input value={b.name} onChange={(e) => patch((d) => { d.branches[i].name = e.target.value; })} placeholder="VD: Cơ sở 1 — Quận 1" />
                </div>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>SĐT cơ sở</label>
                  <input value={b.phone} onChange={(e) => patch((d) => { d.branches[i].phone = e.target.value; })} placeholder="0900 000 001" />
                </div>
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.branches.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
            <div className="afield" style={{ marginTop: "0.6rem" }}>
              <label>Địa chỉ</label>
              <input value={b.address} onChange={(e) => patch((d) => { d.branches[i].address = e.target.value; })} placeholder="123 Đường ABC, Quận 1, TP.HCM" />
            </div>
            <div className="afield">
              <label>Google Maps Embed URL</label>
              <input value={b.mapEmbed} onChange={(e) => patch((d) => { d.branches[i].mapEmbed = e.target.value; })} placeholder="https://www.google.com/maps/embed?pb=..." />
              <small style={{ color: "#6b6480", fontSize: "0.8rem" }}>Google Maps → Chia sẻ → Nhúng bản đồ → copy link trong src=&quot;...&quot;</small>
              {b.mapEmbed && (
                <div style={{ marginTop: "0.5rem", borderRadius: 12, overflow: "hidden", border: "1px solid #e9e6df" }}>
                  <iframe src={(b.mapEmbed.match(/src=["']([^"']+)["']/i)?.[1] ?? b.mapEmbed).trim()} width="100%" height="150" style={{ border: 0, display: "block" }} loading="lazy" title={`Map ${b.name}`} />
                </div>
              )}
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.branches = d.branches ?? []; d.branches.push({ name: "", address: "", phone: "", mapEmbed: "" }); })}>＋ Thêm cơ sở</button>
      </div>
      </>)}

      {/* ===== CHATBOT TƯ VẤN ===== */}
      {activeTab === "chatbot" && (<>
      <div className="card">
        <h2>Chatbot tư vấn 🤖</h2>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontWeight: 700, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={c.chatbot.enabled}
            onChange={(e) => patch((d) => { d.chatbot.enabled = e.target.checked; })}
          />
          Bật chatbot trên trang chủ
        </label>
        <div className="afield">
          <label>Tiêu đề cửa sổ chat</label>
          <input value={c.chatbot.title} onChange={(e) => patch((d) => { d.chatbot.title = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Lời chào đầu</label>
          <textarea value={c.chatbot.greeting} onChange={(e) => patch((d) => { d.chatbot.greeting = e.target.value; })} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={c.chatbot.includeFaq}
            onChange={(e) => patch((d) => { d.chatbot.includeFaq = e.target.checked; })}
          />
          Tự động dùng các câu hỏi FAQ làm chủ đề
        </label>

        <h3 style={{ fontSize: "0.95rem", margin: "0.5rem 0 0.8rem" }}>Chủ đề (nút bấm)</h3>
        {(c.chatbot.topics ?? []).map((t: ChatTopic, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="item-header">
              <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
                <label>Nhãn nút</label>
                <input value={t.label} onChange={(e) => patch((d) => { d.chatbot.topics[i].label = e.target.value; })} />
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.chatbot.topics.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
            <div className="afield" style={{ marginTop: "0.6rem" }}>
              <label>Câu trả lời</label>
              <textarea value={t.answer} onChange={(e) => patch((d) => { d.chatbot.topics[i].answer = e.target.value; })} />
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.chatbot.topics = d.chatbot.topics ?? []; d.chatbot.topics.push({ label: "", answer: "" }); })}>＋ Thêm mới</button>

        <h3 style={{ fontSize: "0.95rem", margin: "1.4rem 0 0.8rem" }}>Thu thập thông tin (Lead)</h3>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={c.chatbot.leadEnabled}
            onChange={(e) => patch((d) => { d.chatbot.leadEnabled = e.target.checked; })}
          />
          Cho phép bot xin tên + SĐT (lưu vào danh sách Lead)
        </label>
        <div className="afield">
          <label>Nhãn nút đăng ký</label>
          <input value={c.chatbot.leadButtonLabel} onChange={(e) => patch((d) => { d.chatbot.leadButtonLabel = e.target.value; })} />
        </div>
        <div className="afield">
          <label>Câu mời để lại thông tin</label>
          <textarea value={c.chatbot.leadPrompt} onChange={(e) => patch((d) => { d.chatbot.leadPrompt = e.target.value; })} />
        </div>
        <div className="row2">
          <div className="afield">
            <label>Câu hỏi xin tên</label>
            <textarea value={c.chatbot.leadAskName} onChange={(e) => patch((d) => { d.chatbot.leadAskName = e.target.value; })} />
          </div>
          <div className="afield">
            <label>Câu hỏi xin SĐT</label>
            <textarea value={c.chatbot.leadAskPhone} onChange={(e) => patch((d) => { d.chatbot.leadAskPhone = e.target.value; })} />
          </div>
        </div>
        <div className="afield">
          <label>Câu cảm ơn sau khi gửi</label>
          <textarea value={c.chatbot.leadSuccess} onChange={(e) => patch((d) => { d.chatbot.leadSuccess = e.target.value; })} />
        </div>
      </div>

      </>)}

      {/* ===== VÒNG QUAY & THÔNG BÁO ===== */}
      {activeTab === "marketing" && (<>
      <div className="card">
        <h2>Vòng quay may mắn 🎡</h2>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontWeight: 700, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={c.wheel.enabled}
            onChange={(e) => patch((d) => { d.wheel.enabled = e.target.checked; })}
          />
          Hiển thị vòng quay trên trang chủ
        </label>
        <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          💡 Mỗi ô là một phần thưởng. &quot;Tên ngắn&quot; hiện trên bánh xe (nên ngắn gọn), &quot;Tên đầy đủ&quot; hiện khi trúng. Khách trúng sẽ để lại SĐT để trung tâm liên hệ trao thưởng.
        </p>
        {(c.wheel.prizes ?? []).map((p: WheelPrize, i: number) => (
          <div key={i} style={{ borderTop: i ? "1px solid #f0eee8" : "none", paddingTop: i ? "0.9rem" : 0, marginTop: i ? "0.6rem" : 0 }}>
            <div className="item-header">
              <div className="afield" style={{ flex: "0 0 64px", marginBottom: 0 }}>
                <label>Màu</label>
                <input type="color" value={p.color || "#80b848"} onChange={(e) => patch((d) => { d.wheel.prizes[i].color = e.target.value; })} style={{ width: "100%", height: 38, padding: 2, cursor: "pointer" }} />
              </div>
              <div className="row2" style={{ flex: 1 }}>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Tên ngắn (trên bánh xe)</label>
                  <input value={p.short} onChange={(e) => patch((d) => { d.wheel.prizes[i].short = e.target.value; })} placeholder="VD: Giảm 10%" />
                </div>
                <div className="afield" style={{ marginBottom: 0 }}>
                  <label>Tên đầy đủ (khi trúng)</label>
                  <input value={p.full} onChange={(e) => patch((d) => { d.wheel.prizes[i].full = e.target.value; })} placeholder="VD: Giảm 10% học phí" />
                </div>
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.wheel.prizes.splice(i, 1); })} title="Xóa">🗑 Xóa</button>
            </div>
          </div>
        ))}
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.wheel.prizes = d.wheel.prizes ?? []; d.wheel.prizes.push({ short: "", full: "", color: "#80b848" }); })}>＋ Thêm phần thưởng</button>
        <p className="muted" style={{ marginTop: "0.6rem", fontSize: "0.82rem" }}>
          Gợi ý: nên để 6–8 ô để bánh xe cân đối. Kết quả quay là ngẫu nhiên giữa các ô.
        </p>
      </div>

      <div className="card">
        <h2>Thông báo &quot;vừa đăng ký học thử&quot; 🔔</h2>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontWeight: 700, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={c.socialProof.enabled}
            onChange={(e) => patch((d) => { d.socialProof.enabled = e.target.checked; })}
          />
          Hiển thị thông báo nổi ở góc trang
        </label>
        <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          💡 Các thông báo nhỏ kiểu &quot;Chị Hương · Quận 7 vừa đăng ký học thử&quot; sẽ lần lượt hiện ở góc dưới để tạo cảm giác đông khách. Danh sách dưới đây hiển thị xoay vòng ngẫu nhiên.
        </p>
        <div className="row2" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          {(c.socialProof.items ?? []).map((s: SocialProofItem, i: number) => (
            <div key={i} className="item-header">
              <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
                <label>Tên hiển thị</label>
                <input value={s.name} onChange={(e) => patch((d) => { d.socialProof.items[i].name = e.target.value; })} placeholder="VD: Chị Hương" />
              </div>
              <div className="afield" style={{ flex: 1, marginBottom: 0 }}>
                <label>Khu vực</label>
                <input value={s.area} onChange={(e) => patch((d) => { d.socialProof.items[i].area = e.target.value; })} placeholder="VD: Quận 7" />
              </div>
              <button className="abtn abtn-del" onClick={() => patch((d) => { d.socialProof.items.splice(i, 1); })} title="Xóa">🗑</button>
            </div>
          ))}
        </div>
        <button className="abtn abtn-add" onClick={() => patch((d) => { d.socialProof.items = d.socialProof.items ?? []; d.socialProof.items.push({ name: "", area: "" }); })}>＋ Thêm thông báo</button>
      </div>
      </>)}

      {/* ===== SỰ KIỆN ===== */}
      {activeTab === "events" && (<>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Sự kiện ({events.length})</h2>
          <button className="abtn" onClick={() => setEditingEvent({ ...EMPTY_EVENT })}>+ Thêm sự kiện</button>
        </div>

        {/* Modal tạo/sửa sự kiện */}
        {editingEvent && (
          <div className="ev-modal">
            <div className="ev-modal-content">
              <h3>{editingEvent.id ? "Sửa sự kiện" : "Tạo sự kiện mới"}</h3>
              <div className="afield">
                <label>Tiêu đề *</label>
                <input value={editingEvent.title} onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })} placeholder="VD: Ngày hội Open Day tháng 7" />
              </div>
              <div className="afield">
                <label>Mô tả</label>
                <textarea rows={7} value={editingEvent.description} onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })} placeholder="Mô tả chi tiết sự kiện..." />
              </div>
              <div className="row2">
                <div className="afield">
                  <label>Ngày diễn ra *</label>
                  <input type="date" value={editingEvent.date ? editingEvent.date.slice(0, 10) : ""} onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value ? new Date(e.target.value).toISOString() : "" })} />
                </div>
                <div className="afield">
                  <label>Ngày kết thúc (nếu nhiều ngày)</label>
                  <input type="date" value={editingEvent.endDate ? editingEvent.endDate.slice(0, 10) : ""} onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
              </div>
              <div className="afield">
                <label>Địa điểm</label>
                <input value={editingEvent.location} onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })} placeholder="VD: 123 Đường ABC, Quận 1" />
              </div>
              <div className="row2">
                <div className="afield">
                  <label>Ảnh bìa</label>
                  {editingEvent.image && <img src={editingEvent.image} alt="preview" style={{ width: "100%", maxWidth: 200, borderRadius: 8, marginBottom: 8, display: "block" }} />}
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadEventImage(e.target.files[0])} />
                </div>
                <div className="afield">
                  <label>Ảnh khác (gallery)</label>
                  <div className="ev-img-gallery">
                    {(JSON.parse(editingEvent.images || "[]") as string[]).map((url, idx) => (
                      <div key={idx} className="ev-img-thumb">
                        <img src={url} alt={`ảnh ${idx + 1}`} />
                        <button onClick={() => removeEventExtraImage(idx)} title="Xoá">✕</button>
                      </div>
                    ))}
                  </div>
                  <input type="file" accept="image/*" multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      Array.from(files).forEach((f) => uploadEventExtraImage(f));
                      e.target.value = "";
                    }}
                  />
                  <small style={{ color: "var(--muted)", display: "block", marginTop: 4 }}>Chọn nhiều ảnh cùng lúc được</small>
                </div>
              </div>
              <div className="row2">
                <div className="afield">
                  <label>Chữ trên nút CTA</label>
                  <input value={editingEvent.ctaText} onChange={(e) => setEditingEvent({ ...editingEvent, ctaText: e.target.value })} placeholder="Đăng ký tham gia" />
                </div>
                <div className="afield">
                  <label>Link CTA</label>
                  <input value={editingEvent.ctaLink} onChange={(e) => setEditingEvent({ ...editingEvent, ctaLink: e.target.value })} placeholder="#signup hoặc https://forms.gle/..." />
                </div>
              </div>
              <div className="row2">
                <div className="afield">
                  <label>Trạng thái</label>
                  <select value={editingEvent.status} onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}>
                    <option value="draft">Bản nháp</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="cancelled">Đã huỷ</option>
                  </select>
                </div>
                <div className="afield">
                  <label>Mẫu trang (template)</label>
                  <select
                    value={editingEvent.template || "default"}
                    onChange={(e) => setEditingEvent({ ...editingEvent, template: e.target.value })}
                  >
                    <option value="default">Mặc định — Sự kiện thường</option>
                    <option value="campaign">Chiến dịch — Landing page chạy ads</option>
                  </select>
                  <small style={{ color: "var(--muted)" }}>
                    Chọn &quot;Chiến dịch&quot; nếu sự kiện này dùng để chạy Facebook Ads (có hero ảnh lớn, ưu đãi, countdown).
                  </small>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.7rem", marginTop: "1rem" }}>
                <button className="abtn abtn-primary" onClick={saveEvent} disabled={eventSaving}>
                  {eventSaving ? "Đang lưu..." : "Lưu sự kiện"}
                </button>
                <button className="abtn" onClick={() => setEditingEvent(null)}>Huỷ</button>
              </div>
            </div>
          </div>
        )}

        {/* Popup link quảng cáo (kèm UTM) */}
        {linkEvent && (
          <div className="ev-modal" onClick={() => setLinkEvent(null)}>
            <div className="ev-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>🔗 Link chạy quảng cáo</h3>
              <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.8rem" }}>
                Sự kiện: <strong>{linkEvent.title}</strong>. Bấm <strong>Copy</strong> ở kênh tương ứng — link đã gắn sẵn UTM để đo nguồn khách.
              </p>
              <div className="afield">
                <label>Tên chiến dịch (utm_campaign)</label>
                <input value={linkCampaign} onChange={(e) => setLinkCampaign(slugify(e.target.value))} placeholder={`su-kien-${linkEvent.id}`} />
                <small style={{ color: "var(--muted)" }}>Chỉ chữ thường/số/gạch ngang. VD: khaigiang-t7</small>
              </div>
              <div className="link-copy-list">
                {[
                  { key: "facebook", label: "Facebook", emoji: "📘" },
                  { key: "zalo", label: "Zalo", emoji: "💬" },
                  { key: "tiktok", label: "TikTok", emoji: "🎵" },
                  { key: "google", label: "Google", emoji: "🔍" },
                ].map((ch) => {
                  const link = buildEventLink(linkEvent, ch.key, linkCampaign);
                  return (
                    <div key={ch.key} className="link-copy-row">
                      <span className="link-copy-name">{ch.emoji} {ch.label}</span>
                      <input className="link-copy-input" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
                      <button className="abtn abtn-primary" onClick={() => copyText(link, ch.label)}>Copy</button>
                    </div>
                  );
                })}
                <div className="link-copy-row">
                  <span className="link-copy-name">🔗 Link gốc</span>
                  <input className="link-copy-input" readOnly value={buildEventLink(linkEvent)} onFocus={(e) => e.currentTarget.select()} />
                  <button className="abtn" onClick={() => copyText(buildEventLink(linkEvent), "gốc")}>Copy</button>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button className="abtn" onClick={() => setLinkEvent(null)}>Đóng</button>
              </div>
            </div>
          </div>
        )}

        {/* Danh sách sự kiện */}
        {events.length === 0 ? (
          <p className="muted">Chưa có sự kiện nào. Bấm "+ Thêm sự kiện" để tạo.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem 1rem", background: "#f8f9f6", borderRadius: 12, border: "1px solid var(--line)" }}>
                {ev.image && <img src={ev.image} alt="" style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 8 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{ev.title}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                    📅 {new Date(ev.date).toLocaleDateString("vi-VN")} ·
                    <span style={{ color: ev.status === "published" ? "var(--green)" : ev.status === "cancelled" ? "#dc3545" : "var(--orange)", fontWeight: 600 }}>
                      {ev.status === "published" ? "Đang hiện" : ev.status === "cancelled" ? "Đã huỷ" : "Đang ẩn"}
                    </span>
                  </div>
                </div>
                {ev.status === "cancelled" ? (
                  <span className="ev-toggle-cancelled" title="Mở 'Sửa' để đổi trạng thái">Đã huỷ</span>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={ev.status === "published"}
                    className={`ev-toggle${ev.status === "published" ? " on" : ""}`}
                    onClick={() => toggleEvent(ev)}
                    title={ev.status === "published" ? "Đang hiện trên trang chủ — bấm để ẩn" : "Đang ẩn — bấm để hiện"}
                  >
                    <span className="ev-toggle-knob" />
                    <span className="ev-toggle-label">{ev.status === "published" ? "Bật" : "Tắt"}</span>
                  </button>
                )}
                <button className="abtn" onClick={() => { setLinkEvent(ev); setLinkCampaign(slugify(ev.title) || `su-kien-${ev.id}`); }} style={{ fontSize: "0.82rem" }} title="Lấy link chạy quảng cáo (kèm UTM)">🔗 Link QC</button>
                <button className="abtn" onClick={() => setEditingEvent(ev)} style={{ fontSize: "0.82rem" }}>Sửa</button>
                <button className="abtn" onClick={() => deleteEvent(ev.id)} style={{ fontSize: "0.82rem", color: "#dc3545" }}>Xóa</button>
              </div>
            ))}
          </div>
        )}
      </div>

      </>)}

      {activeTab === "leads" && (<>
      <div className="card">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Khách đăng ký ({leads.length})</h2>
          {leads.length > 0 && (
            <button className="abtn" onClick={exportCSV}>⬇ Xuất Excel (.csv)</button>
          )}
        </div>
        {leads.length > 0 && (
          <div className="lead-stats">
            {STATUSES.map((s) => {
              const count = leads.filter((l) => (l.status || "new") === s.value).length;
              return (
                <div className="lstat" key={s.value}>
                  <span className="lstat-n">{count}</span>
                  <span className="lstat-l">{s.label}</span>
                </div>
              );
            })}
          </div>
        )}
        {leads.length > 0 && (
          <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.8rem", flexWrap: "wrap" }}>
            <input
              placeholder="🔍 Tìm tên hoặc SĐT..."
              value={leadSearch}
              onChange={(e) => setLeadSearch(e.target.value)}
              style={{ flex: 1, minWidth: 180, padding: "0.5rem 0.75rem", border: "1px solid #ddd", borderRadius: 9, fontSize: "0.9rem", fontFamily: "inherit", background: "#fbfaf7" }}
            />
            {Object.keys(siteLeadCounts).length > 1 && (
              <select
                value={leadSiteFilter}
                onChange={(e) => setLeadSiteFilter(e.target.value)}
                title="Lọc khách theo site"
                style={{ padding: "0.5rem 0.75rem", border: "1px solid #ddd", borderRadius: 9, fontSize: "0.9rem", fontFamily: "inherit", background: "#fbfaf7" }}
              >
                <option value="all">🌐 Mọi site ({leads.length})</option>
                {Object.entries(siteLeadCounts).map(([s, count]) => (
                  <option key={s} value={s}>{s} ({count})</option>
                ))}
              </select>
            )}
            <select
              value={leadFilter}
              onChange={(e) => setLeadFilter(e.target.value)}
              style={{ padding: "0.5rem 0.75rem", border: "1px solid #ddd", borderRadius: 9, fontSize: "0.9rem", fontFamily: "inherit", background: "#fbfaf7" }}
            >
              <option value="all">Tất cả ({leads.length})</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label} ({leads.filter((l) => (l.status || "new") === s.value).length})</option>
              ))}
            </select>
            {(Object.keys(eventLeadCounts).length > 0) && (
              <select
                value={leadEventFilter}
                onChange={(e) => setLeadEventFilter(e.target.value)}
                title="Lọc khách theo sự kiện đã chạy quảng cáo"
                style={{ padding: "0.5rem 0.75rem", border: "1px solid #ddd", borderRadius: 9, fontSize: "0.9rem", fontFamily: "inherit", background: "#fbfaf7" }}
              >
                <option value="all">🎉 Mọi nguồn ({leads.length})</option>
                {Object.entries(eventLeadCounts).map(([id, count]) => (
                  <option key={id} value={id}>{eventTitleById.get(Number(id)) ?? `Sự kiện #${id}`} ({count})</option>
                ))}
                {noEventCount > 0 && <option value="none">Đăng ký thường ({noEventCount})</option>}
              </select>
            )}
          </div>
        )}
        {leads.length === 0 ? (
          <p className="muted">Chưa có ai đăng ký. Khi phụ huynh điền form, dữ liệu sẽ hiện ở đây.</p>
        ) : filteredLeads.length === 0 ? (
          <p className="muted">Không tìm thấy kết quả phù hợp.</p>
        ) : (
          <div className="lead-table-wrap">
            <div className="lead-row h">
              <span>Tên</span><span>SĐT</span><span>Tuổi</span><span>Nguồn</span><span>Trạng thái</span><span>Thời gian</span>
            </div>
            {filteredLeads.map((l) => (
              <div className="lead-row" key={l.id}>
                <span>{l.name}</span>
                <span>{l.phone}</span>
                <span>{l.ageGroup || "—"}</span>
                <span>
                  {Object.keys(siteLeadCounts).length > 1 && (
                    <span style={{ display: "inline-block", background: "#e6effb", color: "#1d5fb0", fontWeight: 700, fontSize: "0.75rem", padding: "1px 7px", borderRadius: 999, marginRight: 4 }}>
                      🌐 {l.site || "default"}
                    </span>
                  )}
                  {l.eventId != null && (
                    <span style={{ display: "inline-block", background: "#eef4de", color: "#5f8f2e", fontWeight: 700, fontSize: "0.75rem", padding: "1px 7px", borderRadius: 999, marginRight: 4 }}>
                      🎉 {eventTitleById.get(l.eventId) ?? `Sự kiện #${l.eventId}`}
                    </span>
                  )}
                  {l.utmSource ? l.utmSource + (l.utmCampaign ? " · " + l.utmCampaign : "") : (l.eventId == null ? "—" : "")}
                </span>
                <span>
                  <select value={l.status || "new"} onChange={(e) => updateStatus(l.id, e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </span>
                <span>{new Date(l.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      </>)}

      {CONTENT_TABS.includes(activeTab) && (
      <div className="save-bar">
        <Btn variant="primary" onClick={save} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Btn>
        {saved && <span className="saved-msg">✓ Đã lưu</span>}

      </div>
      )}
      </div>

      <div className="admin-preview">
        <div className="admin-preview-header">
          <span>👁 Xem trước</span>
          <div className="preview-device">
            {(["desktop", "tablet", "mobile"] as PreviewDevice[]).map((d) => (
              <button key={d} className={previewDevice === d ? "active" : ""} onClick={() => setPreviewDevice(d)} title={d === "desktop" ? "Desktop" : d === "tablet" ? "Tablet (768px)" : "Mobile (375px)"}>
                {d === "desktop" ? "💻" : d === "tablet" ? "📟" : "📱"}
              </button>
            ))}
          </div>
          <button className="abtn" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }} onClick={() => { if (iframeRef.current) iframeRef.current.src = iframeRef.current.src; }}>↻ Tải lại</button>
        </div>
        <div className="preview-iframe-wrap" style={{ display: "flex", justifyContent: "center", flex: 1, overflow: "auto", background: previewDevice !== "desktop" ? "#e9e6df" : "#fff" }}>
          <iframe
            ref={iframeRef}
            src="/"
            title="Preview"
            style={{
              width: PREVIEW_WIDTHS[previewDevice],
              maxWidth: "100%",
              height: "100%",
              border: previewDevice !== "desktop" ? "1px solid #ccc" : "none",
              borderRadius: previewDevice !== "desktop" ? "16px" : 0,
              boxShadow: previewDevice !== "desktop" ? "0 8px 32px rgba(0,0,0,0.12)" : "none",
              background: "#fff",
              transition: "width 0.3s ease, border-radius 0.3s ease, box-shadow 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminEditor({ initial, initialSite }: { initial: SiteContent; initialSite: string }) {
  return (
    <ToastProvider>
      <AdminEditorInner initial={initial} initialSite={initialSite} />
    </ToastProvider>
  );
}
