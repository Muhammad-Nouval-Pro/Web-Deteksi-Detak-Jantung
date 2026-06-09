import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/pasien — Ambil semua pasien
export async function GET() {
  try {
    const pasienList = await prisma.pasien.findMany({
      include: {
        sesi: {
          orderBy: { mulai: "desc" },
          take: 1,
        },
        _count: { select: { sesi: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(pasienList);
  } catch (error) {
    console.error("Error fetching pasien:", error);
    return Response.json({ error: "Gagal mengambil data pasien" }, { status: 500 });
  }
}

// POST /api/pasien — Buat pasien baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, umur, jenisKelamin, domisili } = body;

    if (!nama || !umur || !jenisKelamin || !domisili) {
      return Response.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const pasien = await prisma.pasien.create({
      data: {
        nama,
        umur: parseInt(umur),
        jenisKelamin,
        domisili,
      },
    });

    return Response.json(pasien, { status: 201 });
  } catch (error) {
    console.error("Error creating pasien:", error);
    return Response.json({ error: "Gagal membuat data pasien" }, { status: 500 });
  }
}
