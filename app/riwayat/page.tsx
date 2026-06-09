"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Pasien {
  nama: string;
  umur: number;
  jenisKelamin: string;
  domisili: string;
}

interface Sesi {
  id: number;
  status: string;
  mulai: string;
  selesai: string | null;
  catatan: string | null;
  pasien: Pasien;
  _count: { heartRate: number };
}

export default function RiwayatPage() {
  const [sesiList, setSesiList] = useState<Sesi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/riwayat");
        if (res.ok) {
          const data = await res.json();
          setSesiList(data);
        }
      } catch (err) {
        console.error("Gagal mengambil riwayat:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredSesi = sesiList.filter(
    (s) =>
      s.pasien.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.pasien.domisili.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container animate-in">

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Riwayat Pemeriksaan</h1>
          <p>Cari dan kelola seluruh data sesi pemeriksaan pasien.</p>
        </div>
        <Link href="/pemeriksaan" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Pemeriksaan Baru
        </Link>
      </div>

      {/* Search Bar */}
      <div style={{ position: "relative", marginBottom: "1.5rem", maxWidth: 440 }}>
        <svg
          width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }}
        >
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="form-input"
          placeholder="Cari nama pasien atau domisili..."
          style={{ paddingLeft: "2.5rem" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)",
              display: "flex", alignItems: "center", padding: "0.25rem",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-soft)", display: "flex", gap: "1rem", alignItems: "center" }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div className="skeleton" style={{ height: 13, width: "35%", borderRadius: 6 }} />
                <div className="skeleton" style={{ height: 11, width: "20%", borderRadius: 6 }} />
              </div>
              <div className="skeleton" style={{ height: 24, width: 60, borderRadius: 20 }} />
            </div>
          ))}
        </div>
      ) : filteredSesi.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.25 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3>{search ? "Tidak ditemukan" : "Belum Ada Riwayat"}</h3>
            <p>
              {search
                ? `Tidak ada data yang cocok dengan "${search}"`
                : "Mulai pemeriksaan pertama untuk melihat riwayat di sini."}
            </p>
            {!search && (
              <Link href="/pemeriksaan" className="btn btn-primary">
                Mulai Pemeriksaan
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Stat bar */}
          <div style={{
            padding: "0.75rem 1.25rem",
            borderBottom: "1px solid var(--border-soft)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(10, 13, 20, 0.2)",
          }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-faint)", fontWeight: 500 }}>
              {filteredSesi.length} sesi{search ? " ditemukan" : " total"}
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
              {filteredSesi.filter(s => s.status === "BERLANGSUNG").length > 0 && (
                <span style={{ color: "var(--brand-red-light)" }}>
                  ● {filteredSesi.filter(s => s.status === "BERLANGSUNG").length} live
                </span>
              )}
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pasien</th>
                  <th>Info</th>
                  <th>Tanggal</th>
                  <th>Durasi</th>
                  <th>Status</th>
                  <th>BPM</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredSesi.map((sesi) => {
                  const durasi = sesi.selesai
                    ? Math.round(
                        (new Date(sesi.selesai).getTime() - new Date(sesi.mulai).getTime()) / 60000
                      )
                    : null;

                  return (
                    <tr key={sesi.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                          <div
                            className="patient-avatar"
                            style={{ width: 34, height: 34, fontSize: "0.8rem", borderRadius: 9 }}
                          >
                            {sesi.pasien.nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: "0.875rem" }}>
                              {sesi.pasien.nama}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
                              {sesi.pasien.domisili}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.825rem", color: "var(--text-body)", fontWeight: 500 }}>
                          {sesi.pasien.umur} thn
                        </div>
                        <span
                          className={`badge ${sesi.pasien.jenisKelamin === "LAKI_LAKI" ? "badge-cyan" : "badge-amber"}`}
                          style={{ marginTop: "0.2rem", fontSize: "0.67rem" }}
                        >
                          {sesi.pasien.jenisKelamin === "LAKI_LAKI" ? "L" : "P"}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.825rem", color: "var(--text-body)", fontWeight: 500 }}>
                          {new Date(sesi.mulai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
                          {new Date(sesi.mulai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.825rem", color: durasi ? "var(--text-body)" : "var(--text-faint)", fontFamily: durasi ? "var(--font-mono)" : "inherit" }}>
                          {durasi !== null ? `${durasi} mnt` : "—"}
                        </span>
                      </td>
                      <td>
                        {sesi.status === "BERLANGSUNG" ? (
                          <span className="live-indicator active">
                            <span className="live-dot" />
                            Live
                          </span>
                        ) : (
                          <span className="badge badge-green">Selesai</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "var(--text-heading)", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
                          {sesi._count.heartRate}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginLeft: "0.25rem" }}>titik</span>
                      </td>
                      <td>
                        <Link
                          href={sesi.status === "BERLANGSUNG" ? `/monitor/${sesi.id}` : `/riwayat/${sesi.id}`}
                          className="btn btn-sm btn-outline"
                        >
                          {sesi.status === "BERLANGSUNG" ? "Monitor" : "Detail"}
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
