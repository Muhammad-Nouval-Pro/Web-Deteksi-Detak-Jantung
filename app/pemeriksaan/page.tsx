"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PemeriksaanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nama: "",
    umur: "",
    jenisKelamin: "",
    domisili: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.nama || !form.umur || !form.jenisKelamin || !form.domisili) {
      setError("Semua field wajib diisi sebelum memulai pemeriksaan.");
      return;
    }

    setLoading(true);

    try {
      const pasienRes = await fetch("/api/pasien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!pasienRes.ok) throw new Error("Gagal membuat data pasien");
      const pasien = await pasienRes.json();

      const sesiRes = await fetch("/api/sesi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pasienId: pasien.id }),
      });

      if (!sesiRes.ok) throw new Error("Gagal membuat sesi pemeriksaan");
      const sesi = await sesiRes.json();

      router.push(`/monitor/${sesi.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  const steps = [
    { num: 1, text: "Isi data pasien di form ini" },
    { num: 2, text: "Klik \"Mulai Pemeriksaan\"" },
    { num: 3, text: "Pasang Pulse Sensor pada jari pasien" },
    { num: 4, text: "Arduino otomatis mengirim data BPM" },
    { num: 5, text: "Grafik real-time tampil di halaman monitor" },
  ];

  return (
    <div className="page-container animate-in">

      {/* Back nav */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/" className="btn btn-sm btn-outline">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Kembali
        </Link>
      </div>

      {/* Page header */}
      <div className="page-header">
        <h1>Pemeriksaan Baru</h1>
        <p>Lengkapi data pasien untuk memulai sesi monitoring detak jantung secara real-time.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>

        {/* Form Card */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--border-soft)" }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "rgba(232, 64, 85, 0.12)",
              border: "1px solid rgba(232, 64, 85, 0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red-light)" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-heading)" }}>Data Pasien</div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-faint)" }}>Semua field wajib diisi</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nama" className="form-label">Nama Lengkap</label>
              <input
                id="nama"
                name="nama"
                type="text"
                className="form-input"
                placeholder="Masukkan nama lengkap pasien"
                value={form.nama}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="umur" className="form-label">Umur</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="umur"
                    name="umur"
                    type="number"
                    className="form-input"
                    placeholder="25"
                    min={1}
                    max={150}
                    value={form.umur}
                    onChange={handleChange}
                    style={{ paddingRight: "3rem" }}
                  />
                  <span style={{ position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "var(--text-faint)", pointerEvents: "none" }}>
                    thn
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="jenisKelamin" className="form-label">Jenis Kelamin</label>
                <select
                  id="jenisKelamin"
                  name="jenisKelamin"
                  className="form-select"
                  value={form.jenisKelamin}
                  onChange={handleChange}
                >
                  <option value="">Pilih...</option>
                  <option value="LAKI_LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="domisili" className="form-label">Domisili</label>
              <input
                id="domisili"
                name="domisili"
                type="text"
                className="form-input"
                placeholder="Contoh: Jakarta Selatan"
                value={form.domisili}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            {error && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: "0.6rem",
                padding: "0.75rem 1rem",
                background: "rgba(232, 64, 85, 0.07)",
                border: "1px solid rgba(232, 64, 85, 0.2)",
                borderRadius: 9,
                color: "var(--brand-red-light)",
                fontSize: "0.85rem",
                marginBottom: "1.2rem",
                lineHeight: 1.5,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
              style={{ marginTop: "0.5rem" }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                  Memulai Sesi...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="white" strokeWidth="0"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/></svg>
                  Mulai Pemeriksaan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Side info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Steps */}
          <div className="card" style={{ background: "rgba(232, 64, 85, 0.04)", borderColor: "rgba(232, 64, 85, 0.12)" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand-red-light)", marginBottom: "1rem" }}>
              Cara Penggunaan
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {steps.map((step) => (
                <div key={step.num} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(232, 64, 85, 0.12)",
                    border: "1px solid rgba(232, 64, 85, 0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", fontWeight: 800, color: "var(--brand-red-light)",
                    marginTop: "0.05rem",
                  }}>
                    {step.num}
                  </div>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sensor info */}
          <div className="card" style={{ borderColor: "rgba(45, 212, 191, 0.12)", background: "rgba(45, 212, 191, 0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--accent-teal)" }}>Info Perangkat</span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-faint)", lineHeight: 1.6, margin: 0 }}>
              Pastikan Arduino sudah terhubung ke jaringan yang sama dan Pulse Sensor terpasang dengan benar pada jari pasien.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .pemeriksaan-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
