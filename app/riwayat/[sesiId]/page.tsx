"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import HeartRateChart from "@/app/components/HeartRateChart";
import Link from "next/link";

interface HeartRateData { id: number; bpm: number; timestamp: string; }
interface Pasien { nama: string; umur: number; jenisKelamin: string; domisili: string; }
interface SesiDetail {
  id: number; status: string; mulai: string; selesai: string | null;
  catatan: string | null; pasien: Pasien; heartRate: HeartRateData[];
}

export default function RiwayatDetailPage() {
  const params = useParams();
  const sesiId = params.sesiId as string;
  const [sesi, setSesi] = useState<SesiDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sesi/${sesiId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setSesi(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sesiId]);

  const downloadCSV = () => {
    if (!sesi?.heartRate) return;
    const csv = [
      "Timestamp,BPM",
      ...sesi.heartRate.map((d) => `${new Date(d.timestamp).toISOString()},${d.bpm}`),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `HeartRate_${sesi.pasien.nama}_${sesiId}.csv`;
    a.click();
  };

  if (loading) return (
    <div className="page-container">
      <div className="skeleton" style={{ height: 80, borderRadius: 14, marginBottom: "1rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1rem" }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />)}
      </div>
      <div className="skeleton" style={{ height: 340, borderRadius: 14 }} />
    </div>
  );

  if (!sesi) return (
    <div className="page-container">
      <div className="card"><div className="empty-state">
        <h3>Data Tidak Ditemukan</h3>
        <p>Sesi ini tidak tersedia atau telah dihapus.</p>
        <Link href="/riwayat" className="btn btn-outline">← Kembali</Link>
      </div></div>
    </div>
  );

  const hr = sesi.heartRate;
  const avgBpm = hr.length ? Math.round(hr.reduce((s, d) => s + d.bpm, 0) / hr.length) : 0;
  const maxBpm = hr.length ? Math.max(...hr.map(d => d.bpm)) : 0;
  const minBpm = hr.length ? Math.min(...hr.map(d => d.bpm)) : 0;
  const durasi = sesi.selesai
    ? Math.round((new Date(sesi.selesai).getTime() - new Date(sesi.mulai).getTime()) / 60000)
    : null;

  return (
    <div className="page-container animate-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
        <Link href="/riwayat" className="btn btn-sm btn-outline">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Kembali
        </Link>
        <button onClick={downloadCSV} className="btn btn-sm btn-success">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Unduh CSV
        </button>
      </div>

      {/* Patient card */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="patient-avatar" style={{ width: 56, height: 56, fontSize: "1.4rem", borderRadius: 14 }}>
            {sesi.pasien.nama.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "var(--text-heading)", letterSpacing: "-0.03em" }}>{sesi.pasien.nama}</h1>
              <span className="badge badge-green">Selesai</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 1rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <span>{sesi.pasien.umur} tahun</span>
              <span>•</span>
              <span>{sesi.pasien.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}</span>
              <span>•</span>
              <span>{sesi.pasien.domisili}</span>
              <span>•</span>
              <span>{new Date(sesi.mulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              {durasi && <><span>•</span><span>{durasi} menit</span></>}
            </div>
            {sesi.catatan && (
              <div style={{ marginTop: "1rem", padding: "0.875rem 1rem", background: "rgba(45,212,191,0.04)", border: "1px solid rgba(45,212,191,0.12)", borderLeft: "3px solid var(--accent-teal)", borderRadius: "0 9px 9px 0" }}>
                <div style={{ fontSize: "0.68rem", color: "var(--accent-teal)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.3rem" }}>Catatan Medis</div>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-body)", fontStyle: "italic", lineHeight: 1.6 }}>"{sesi.catatan}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
        {[
          { label: "Rata-rata", value: avgBpm, unit: "BPM", color: "var(--accent-green)" },
          { label: "Tertinggi", value: maxBpm, unit: "BPM", color: "var(--brand-red-light)" },
          { label: "Terendah", value: minBpm, unit: "BPM", color: "var(--accent-amber)" },
          { label: "Total Data", value: hr.length, unit: "titik", color: "var(--accent-teal)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "1.1rem" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700, marginBottom: "0.4rem" }}>{s.label}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.04em", color: s.color, lineHeight: 1, fontFamily: "var(--font-mono)" }}>{s.value || "—"}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.2rem" }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <div style={{ marginBottom: "1rem" }}>
          <div className="section-title">Visualisasi Data</div>
          <h2 style={{ fontSize: "0.975rem", fontWeight: 700, margin: 0, color: "var(--text-heading)" }}>Grafik Detak Jantung</h2>
        </div>
        <HeartRateChart data={hr} isLive={false} />
      </div>
    </div>
  );
}
