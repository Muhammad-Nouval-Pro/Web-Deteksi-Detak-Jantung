import { prisma } from "@/app/lib/prisma";

// DELETE /api/reset — Hapus semua data dan reset ID dari awal
export async function DELETE() {
  try {
    // Hapus data secara berurutan karena ada relasi (FK constraints)
    // 1. Hapus semua heart_rate terlebih dahulu
    await prisma.heartRate.deleteMany({});

    // 2. Hapus semua sesi
    await prisma.sesi.deleteMany({});

    // 3. Hapus semua pasien
    await prisma.pasien.deleteMany({});

    // 4. Reset auto-increment sequence ke 1
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE heart_rate_id_seq RESTART WITH 1`
    );
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE sesi_id_seq RESTART WITH 1`
    );
    await prisma.$executeRawUnsafe(
      `ALTER SEQUENCE pasien_id_seq RESTART WITH 1`
    );

    return Response.json({
      success: true,
      message: "Semua data berhasil dihapus dan ID direset ke 1",
    });
  } catch (error) {
    console.error("Error resetting data:", error);
    return Response.json(
      { error: "Gagal mereset data", detail: String(error) },
      { status: 500 }
    );
  }
}
