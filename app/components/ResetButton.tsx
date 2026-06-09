"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetButton() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

  async function handleReset() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/reset", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: data.message });
        setTimeout(() => {
          setShowConfirm(false);
          setResult(null);
          router.refresh();
        }, 1500);
      } else {
        setResult({ success: false, message: data.error || "Gagal mereset data" });
      }
    } catch {
      setResult({ success: false, message: "Terjadi kesalahan jaringan" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className="btn btn-sm"
        onClick={() => setShowConfirm(true)}
        style={{
          background: "rgba(232, 64, 85, 0.07)",
          color: "var(--brand-red-light)",
          border: "1px solid rgba(232, 64, 85, 0.18)",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
        Reset Data
      </button>

      {showConfirm && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: "1.5rem",
            animation: "fadeIn 0.18s ease-out",
          }}
          onClick={() => !loading && setShowConfirm(false)}
        >
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-medium)",
              borderRadius: 16,
              padding: "1.75rem",
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5)",
              animation: "slideUpScale 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div style={{
              width: 48, height: 48, borderRadius: 13,
              background: "rgba(232, 64, 85, 0.1)",
              border: "1px solid rgba(232, 64, 85, 0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1.25rem",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-red-light)" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-heading)", margin: "0 0 0.5rem" }}>
              Reset Semua Data?
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.65, margin: "0 0 1.5rem" }}>
              Tindakan ini akan{" "}
              <strong style={{ color: "var(--brand-red-light)" }}>menghapus seluruh data</strong>{" "}
              pasien, sesi pemeriksaan, dan data detak jantung secara permanen. ID akan direset mulai dari 1.
            </p>

            {result && (
              <div style={{
                padding: "0.7rem 1rem",
                borderRadius: 9,
                fontSize: "0.82rem",
                marginBottom: "1.1rem",
                display: "flex", alignItems: "center", gap: "0.5rem",
                background: result.success ? "rgba(52, 211, 153, 0.08)" : "rgba(232, 64, 85, 0.08)",
                border: `1px solid ${result.success ? "rgba(52, 211, 153, 0.2)" : "rgba(232, 64, 85, 0.2)"}`,
                color: result.success ? "var(--accent-green)" : "var(--brand-red-light)",
              }}>
                {result.success ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
                {result.message}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => { setShowConfirm(false); setResult(null); }}
                disabled={loading}
              >
                Batal
              </button>
              <button
                className="btn"
                style={{
                  flex: 1,
                  background: loading ? "rgba(232, 64, 85, 0.4)" : "var(--brand-red)",
                  color: "#fff",
                  border: "none",
                  cursor: loading ? "wait" : "pointer",
                }}
                onClick={handleReset}
                disabled={loading || result?.success === true}
              >
                {loading ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Menghapus...
                  </>
                ) : "Ya, Hapus Semua"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpScale {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
