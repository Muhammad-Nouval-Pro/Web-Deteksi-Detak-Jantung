import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/sesi/[id] — Ambil detail sesi beserta data heart rate
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sesi = await prisma.sesi.findUnique({
      where: { id: parseInt(id) },
      include: {
        pasien: true,
        heartRate: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!sesi) {
      return Response.json({ error: "Sesi tidak ditemukan" }, { status: 404 });
    }

    return Response.json(sesi);
  } catch (error) {
    console.error("Error fetching sesi:", error);
    return Response.json({ error: "Gagal mengambil data sesi" }, { status: 500 });
  }
}

// PATCH /api/sesi/[id] — Akhiri sesi
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { catatan } = body;

    const sesi = await prisma.sesi.update({
      where: { id: parseInt(id) },
      data: {
        status: "SELESAI",
        selesai: new Date(),
        catatan: catatan || undefined,
      },
    });

    return Response.json(sesi);
  } catch (error) {
    console.error("Error ending sesi:", error);
    return Response.json({ error: "Gagal mengakhiri sesi" }, { status: 500 });
  }
}
