"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Dashboard", icon: "⊡" },
    { href: "/pemeriksaan", label: "Pemeriksaan", icon: "＋" },
    { href: "/riwayat", label: "Riwayat", icon: "⊞" },
  ];

  return (
    <nav
      className="navbar"
      style={{
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.35)" : "none",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand" onClick={() => setOpen(false)}>
          {/* <div className="navbar-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
                fill="white"
                fillOpacity="0.95"
              />
            </svg>
          </div> */}
          <div className="navbar-title">
            Pulse Monitor
          </div>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="4" y1="8" x2="20" y2="8" />
              <line x1="4" y1="16" x2="20" y2="16" />
            </svg>
          )}
        </button>

        <div className={`navbar-links ${open ? "open" : ""}`}>
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-link ${isActive ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
