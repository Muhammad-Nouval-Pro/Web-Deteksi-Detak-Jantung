import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

// Utility untuk menambahkan CORS headers (agar ESP32 bisa akses)
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// OPTIONS preflight handler
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// POST /api/heart-rate — Terima data BPM dari Arduino
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sesiId, bpm } = body;

    // Log untuk debug (Cek di terminal laptop Anda!)
    console.log(`📥 DATA MASUK -> Sesi ID: ${sesiId}, BPM: ${bpm}`);

    const parsedSesiId = Number(sesiId);
    const parsedBpm = Number(bpm);

    if (!parsedSesiId || isNaN(parsedBpm)) {
      console.log(`❌ INVALID DATA -> sesiId: ${sesiId}, bpm: ${bpm}`);
      return Response.json(
        { error: "sesiId dan bpm wajib diisi" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Cek apakah sesi masih berlangsung
    const sesi = await prisma.sesi.findUnique({
      where: { id: parsedSesiId },
    });

    if (!sesi) {
      return Response.json({ error: "Sesi tidak ditemukan" }, { status: 404, headers: corsHeaders() });
    }

    if (sesi.status === "SELESAI") {
      return Response.json({ error: "Sesi sudah selesai" }, { status: 400, headers: corsHeaders() });
    }

    const heartRate = await prisma.heartRate.create({
      data: {
        sesiId: parsedSesiId,
        bpm: parsedBpm,
      },
    });

    console.log(`✅ DATA TERSIMPAN -> ID: ${heartRate.id}, BPM: ${parsedBpm}`);
    return Response.json(heartRate, { status: 201, headers: corsHeaders() });
  } catch (error) {
    console.error("Error saving heart rate:", error);
    return Response.json(
      { error: "Gagal menyimpan data detak jantung" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// GET /api/heart-rate?sesiId=X&after=timestamp — Ambil data heart rate untuk grafik
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sesiId = searchParams.get("sesiId");
    const after = searchParams.get("after");

    if (!sesiId) {
      return Response.json({ error: "sesiId wajib diisi" }, { status: 400 });
    }

    const where: Record<string, unknown> = {
      sesiId: parseInt(sesiId),
    };

    // Jika ada parameter 'after', ambil hanya data setelah timestamp tersebut
    if (after) {
      where.timestamp = { gt: new Date(after) };
    }

    const heartRateData = await prisma.heartRate.findMany({
      where,
      orderBy: { timestamp: "asc" },
      take: 500, // Batasi 500 data terakhir
    });

    return Response.json(heartRateData);
  } catch (error) {
    console.error("Error fetching heart rate:", error);
    return Response.json(
      { error: "Gagal mengambil data detak jantung" },
      { status: 500 }
    );
  }
}
