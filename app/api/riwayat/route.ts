import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const sesiList = await prisma.sesi.findMany({
      orderBy: { mulai: "desc" },
      include: {
        pasien: true,
        _count: { select: { heartRate: true } },
      },
    });

    return Response.json(sesiList);
  } catch (error) {
    console.error("Error fetching riwayat:", error);
    return Response.json({ error: "Gagal mengambil data riwayat" }, { status: 500 });
  }
}
