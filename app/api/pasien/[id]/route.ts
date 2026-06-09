import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/pasien/[id] — Ambil detail pasien beserta semua sesi
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pasien = await prisma.pasien.findUnique({
      where: { id: parseInt(id) },
      include: {
        sesi: {
          orderBy: { mulai: "desc" },
          include: {
            _count: { select: { heartRate: true } },
          },
        },
      },
    });

    if (!pasien) {
      return Response.json({ error: "Pasien tidak ditemukan" }, { status: 404 });
    }

    return Response.json(pasien);
  } catch (error) {
    console.error("Error fetching pasien:", error);
    return Response.json({ error: "Gagal mengambil data pasien" }, { status: 500 });
  }
}
