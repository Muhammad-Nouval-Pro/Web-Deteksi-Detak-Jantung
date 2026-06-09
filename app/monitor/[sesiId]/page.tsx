"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import HeartRateChart from "@/app/components/HeartRateChart";
import Link from "next/link";

interface HeartRateData { id: number; bpm: number; timestamp: string; }
interface Pasien { nama: string; umur: number; jenisKelamin: string; domisili: string; }
interface SesiDetail {
  id: number; status: string; mulai: string; selesai: string | null;
  catatan: string | null; pasien: Pasien; heartRate: HeartRateData[];
}

export default function MonitorPage() {
  const params = useParams();
  const router = useRouter();
  const sesiId = params.sesiId as string;

  const [sesi, setSesi] = useState<SesiDetail | null>(null);
  const [heartRateData, setHeartRateData] = useState<HeartRateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [showEndModal, setShowEndModal] = useState(false);
  const [lastDataAt, setLastDataAt] = useState<Date | null>(null);
  const [sensorActive, setSensorActive] = useState(false);

  useEffect(() => {
    fetch(`/api/sesi/${sesiId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setSesi(data);
          setHeartRateData(data.heartRate || []);
          if (data.heartRate?.length > 0) {
            setLastDataAt(new Date(data.heartRate[data.heartRate.length - 1].timestamp));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sesiId]);

  const pollData = useCallback(async () => {
    if (!sesi || sesi.status === "SELESAI") return;
    try {
      const last = heartRateData.length > 0 ? heartRateData[heartRateData.length - 1].timestamp : "";
      const url = last ? `/api/heart-rate?sesiId=${sesiId}&after=${last}` : `/api/heart-rate?sesiId=${sesiId}`;
      const res = await fetch(url);
      if (res.ok) {
        const newData: HeartRateData[] = await res.json();
        if (newData.length > 0) {
          setHeartRateData(prev => [...prev, ...newData]);
          setLastDataAt(new Date());
          setSensorActive(true);
        }
      }
    } catch { /* silent */ }
  }, [sesi, heartRateData, sesiId]);

  useEffect(() => {
    if (!sesi || sesi.status === "SELESAI") return;
    const id = setInterval(pollData, 1500);
    return () => clearInterval(id);
  }, [pollData, sesi]);

  useEffect(() => {
    const id = setInterval(() => {
      if (lastDataAt) setSensorActive((Date.now() - lastDataAt.getTime()) < 5000);
    }, 2000);
    return () => clearInterval(id);
  }, [lastDataAt]);

  async function handleConfirmEnd() {
    setEnding(true);
    try {
      const res = await fetch(`/api/sesi/${sesiId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catatan }),
      });
      if (res.ok) router.push(`/riwayat/${sesiId}`);
      else setEnding(false);
    } catch { setEnding(false); }
  }

  const latestBpm = heartRateData.length > 0 ? heartRateData[heartRateData.length - 1].bpm : 0;
  const avgBpm = heartRateData.length > 0
    ? Math.round(heartRateData.reduce((s, d) => s + d.bpm, 0) / heartRateData.length) : 0;
  const maxBpm = heartRateData.length > 0 ? Math.max(...heartRateData.map(d => d.bpm)) : 0;

  function getBpmColor(bpm: number) {
    if (bpm === 0) return "var(--text-faint)";
    if (bpm < 60) return "var(--accent-amber)";
    if (bpm > 100) return "var(--brand-red-light)";
    return "var(--accent-green)";
  }

  function getBpmLabel(bpm: number) {
    if (bpm === 0) return "Menunggu";
    if (bpm < 60) return "Bradikardi";
    if (bpm > 100) return "Takikardi";
    return "Normal";
  }

  const isLive = sesi?.status === "BERLANGSUNG";

  if (loading) return (
    <div className="page-container">
      <div className="skeleton" style={{ height: 70, borderRadius: 14, marginBottom: "1rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
      </div>
      <div className="skeleton" style={{ height: 340, borderRadius: 14 }} />
    </div>
  );

  return (
    <div className="page-container animate-in">

      {/* Header */}
      <div className="monitor-header">
        <div className="patient-info">
          <div className="patient-avatar" style={{ width: 48, height: 48, fontSize: "1.2rem", borderRadius: 13 }}>
            {sesi?.pasien.nama.charAt(0).toUpperCase()}
          </div>
          <div className="patient-details">
            <h2>{sesi?.pasien.nama}</h2>
            <p>{sesi?.pasien.umur} thn &bull; {sesi?.pasien.domisili}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {isLive && (
            <span className={`live-indicator ${sensorActive ? "active" : "inactive"}`}
              style={sensorActive
                ? { background: "rgba(52,211,153,0.1)", color: "var(--accent-green)", borderColor: "rgba(52,211,153,0.2)" }
                : undefined}
            >
              <span className="live-dot" style={sensorActive ? { background: "var(--accent-green)" } : undefined} />
              {sensorActive ? "Sensor Terhubung" : "Sensor Terputus"}
            </span>
          )}
          {!isLive && <span className="badge badge-green">Selesai</span>}
          <Link href="/riwayat" className="btn btn-sm btn-outline">← Riwayat</Link>
          {isLive && (
            <button onClick={() => setShowEndModal(true)} className="btn btn-danger btn-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              Akhiri Sesi
            </button>
          )}
        </div>
      </div>

      {/* BPM Stats */}
      <div className="stats-grid" style={{ marginBottom: "1.25rem" }}>
        {/* Big BPM */}
        <div className="card card-glow-red" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
            {isLive && <span className="pulse-icon" style={{ fontSize: "0.8rem" }}>❤️</span>}
            BPM Real-Time
          </div>
          <div style={{ fontSize: "3.5rem", fontWeight: 900, letterSpacing: "-0.05em", color: getBpmColor(latestBpm), lineHeight: 1, fontFamily: "var(--font-mono)" }}>
            {latestBpm || "—"}
          </div>
          <div style={{ marginTop: "0.6rem" }}>
            <span className="badge" style={{ background: `${getBpmColor(latestBpm)}18`, color: getBpmColor(latestBpm), border: `1px solid ${getBpmColor(latestBpm)}30`, fontSize: "0.72rem" }}>
              {getBpmLabel(latestBpm)}
            </span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className="stat-info">
            <h3>Rata-rata</h3>
            <div className="stat-value">{avgBpm || "—"}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon red">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div className="stat-info">
            <h3>Tertinggi</h3>
            <div className="stat-value" style={{ color: maxBpm > 100 ? "var(--brand-red-light)" : undefined }}>{maxBpm || "—"}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <div className="section-title">Live Data</div>
            <h2 style={{ fontSize: "0.975rem", fontWeight: 700, margin: 0, color: "var(--text-heading)" }}>Grafik Detak Jantung</h2>
          </div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
            {heartRateData.length} titik data
          </span>
        </div>
        <HeartRateChart data={heartRateData} isLive={isLive} />
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
          onClick={() => !ending && setShowEndModal(false)}
        >
          <div
            className="card animate-in"
            style={{ maxWidth: 480, width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border-medium)" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(232,64,85,0.1)", border: "1px solid rgba(232,64,85,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red-light)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-heading)" }}>Akhiri Pemeriksaan</h2>
                <p style={{ fontSize: "0.78rem", color: "var(--text-faint)", margin: 0 }}>Sesi akan ditandai sebagai selesai</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Catatan Medis <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(opsional)</span></label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Tuliskan hasil diagnosis atau catatan singkat..."
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowEndModal(false)} disabled={ending}>
                Batal
              </button>
              <button className="btn btn-danger" style={{ flex: 1, background: "var(--brand-red)", color: "#fff", borderColor: "var(--brand-red)" }} disabled={ending} onClick={handleConfirmEnd}>
                {ending ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Menyimpan...</>
                ) : "Simpan & Selesai"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
