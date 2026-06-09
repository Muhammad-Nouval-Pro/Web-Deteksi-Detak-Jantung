import { prisma } from "@/app/lib/prisma";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  try {
    // Cari sesi terbaru yang statusnya masih BERLANGSUNG
    const sesiAktif = await prisma.sesi.findFirst({
      where: { status: "BERLANGSUNG" },
      orderBy: { mulai: "desc" },
      select: { id: true }
    });

    if (!sesiAktif) {
      return Response.json({ id: null, message: "Tidak ada sesi aktif" }, { headers: corsHeaders });
    }

    console.log(`🔍 Sesi aktif ditemukan: ID ${sesiAktif.id}`);
    return Response.json({ id: sesiAktif.id }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching active session:", error);
    return Response.json({ error: "Gagal mengambil sesi aktif" }, { status: 500, headers: corsHeaders });
  }
}
