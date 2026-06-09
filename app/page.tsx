import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import ResetButton from "@/app/components/ResetButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let totalPasien = 0;
  let totalSesi = 0;
  let sesiAktif = 0;
  let recentSesi: any[] = [];
  let dbError = false;

  try {
    const results = await Promise.all([
      prisma.pasien.count(),
      prisma.sesi.count(),
      prisma.sesi.count({ where: { status: "BERLANGSUNG" } }),
      prisma.sesi.findMany({
        take: 5,
        orderBy: { mulai: "desc" },
        include: {
          pasien: true,
          _count: { select: { heartRate: true } },
        },
      }),
    ]);
    totalPasien = results[0];
    totalSesi = results[1];
    sesiAktif = results[2];
    recentSesi = results[3];
  } catch (err) {
    console.error("Database error:", err);
    dbError = true;
  }

  return (
    <div className="page-container animate-in">

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: sesiAktif > 0 ? "var(--brand-red)" : "var(--text-faint)",
              boxShadow: sesiAktif > 0 ? "0 0 8px var(--brand-red)" : "none",
              animation: sesiAktif > 0 ? "blinkDot 1.4s ease-in-out infinite" : "none",
            }} />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: sesiAktif > 0 ? "var(--brand-red-light)" : "var(--text-faint)" }}>
              {sesiAktif > 0 ? `${sesiAktif} Sesi Berlangsung` : "Tidak Ada Sesi Aktif"}
            </span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.035em", color: "var(--text-heading)", margin: 0, lineHeight: 1.2 }}>
            Dashboard Monitoring
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "0.35rem" }}>
            Sistem Monitoring Detak Jantung Real-Time berbasis Pulse Sensor
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/pemeriksaan" className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Pemeriksaan Baru
          </Link>
          <ResetButton />
        </div>
      </div>

      {dbError && (
        <div className="card" style={{ marginBottom: "1.5rem", borderColor: "rgba(251, 191, 36, 0.2)", background: "rgba(251, 191, 36, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p style={{ margin: 0, color: "var(--accent-amber)", fontSize: "0.875rem", fontWeight: 500 }}>
              Gagal terhubung ke database. Pastikan koneksi tersedia dan coba refresh halaman.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="card stat-card card-glow-cyan">
          <div className="stat-icon cyan">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div className="stat-info">
            <h3>Total Pasien</h3>
            <div className="stat-value">{totalPasien}</div>
          </div>
        </div>

        <div className="card stat-card card-glow-cyan">
          <div className="stat-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div className="stat-info">
            <h3>Total Pemeriksaan</h3>
            <div className="stat-value">{totalSesi}</div>
          </div>
        </div>

        <div className="card stat-card card-glow-red">
          <div className="stat-icon red">
            <span className="pulse-icon" style={{ fontSize: "1.1rem", lineHeight: 1 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--brand-red-light)">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
              </svg>
            </span>
          </div>
          <div className="stat-info">
            <h3>Sesi Aktif</h3>
            <div className="stat-value" style={{ color: sesiAktif > 0 ? "var(--brand-red-light)" : "var(--text-heading)" }}>
              {sesiAktif}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <div className="section-title">Aktivitas Terbaru</div>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>
              Pemeriksaan Terakhir
            </h2>
          </div>
          <Link href="/riwayat" className="btn btn-sm btn-outline">
            Lihat Semua
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>

        {recentSesi.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.3 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h3>Belum Ada Pemeriksaan</h3>
            <p>Mulai pemeriksaan pertama untuk melihat data detak jantung pasien di sini.</p>
            <Link href="/pemeriksaan" className="btn btn-primary">
              Mulai Pemeriksaan
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pasien</th>
                  <th>Gender</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th>BPM Data</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentSesi.map((sesi) => (
                  <tr key={sesi.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                        <div
                          className="patient-avatar"
                          style={{ width: 32, height: 32, fontSize: "0.75rem", borderRadius: 8, flexShrink: 0 }}
                        >
                          {sesi.pasien.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-heading)", fontSize: "0.875rem" }}>{sesi.pasien.nama}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
                            {sesi.pasien.umur} tahun
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${sesi.pasien.jenisKelamin === "LAKI_LAKI" ? "badge-cyan" : "badge-amber"}`}>
                        {sesi.pasien.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-body)", fontSize: "0.825rem" }}>
                      {new Date(sesi.mulai).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <div style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
                        {new Date(sesi.mulai).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td>
                      {sesi.status === "BERLANGSUNG" ? (
                        <span className="live-indicator active">
                          <span className="live-dot"></span> Live
                        </span>
                      ) : (
                        <span className="badge badge-green">Selesai</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--text-heading)", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}>
                        {sesi._count.heartRate}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-faint)", marginLeft: "0.3rem" }}>titik</span>
                    </td>
                    <td>
                      <Link
                        href={sesi.status === "BERLANGSUNG" ? `/monitor/${sesi.id}` : `/riwayat/${sesi.id}`}
                        className="btn btn-sm btn-outline"
                      >
                        {sesi.status === "BERLANGSUNG" ? "Monitor" : "Detail"}
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
