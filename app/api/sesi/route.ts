import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

// POST /api/sesi — Buat sesi pemeriksaan baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pasienId, catatan } = body;

    if (!pasienId) {
      return Response.json({ error: "pasienId wajib diisi" }, { status: 400 });
    }

    const sesi = await prisma.sesi.create({
      data: {
        pasienId: parseInt(pasienId),
        catatan: catatan || null,
      },
      include: {
        pasien: true,
      },
    });

    return Response.json(sesi, { status: 201 });
  } catch (error) {
    console.error("Error creating sesi:", error);
    return Response.json({ error: "Gagal membuat sesi" }, { status: 500 });
  }
}
