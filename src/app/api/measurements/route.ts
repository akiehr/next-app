import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.weight || !body.height || !body.date) {
      return NextResponse.json(
        {
          error: "Faltan campos requeridos: weight, height y date",
        },
        { status: 400 }
      );
    }

    // Validar que weight y height sean números positivos
    const weight = parseFloat(body.weight);
    const height = parseFloat(body.height);

    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
      return NextResponse.json(
        {
          error: "Peso y altura deben ser números positivos",
        },
        { status: 400 }
      );
    }

    // Calcular IMC (peso en kg / altura en m²)
    const heightInMeters = height / 100; // convertir cm a m
    const bmi = weight / (heightInMeters * heightInMeters);

    const measurement = {
      id: Date.now().toString(),
      weight: weight,
      height: height,
      bmi: parseFloat(bmi.toFixed(2)),
      date: body.date,
      notes: body.notes || null,
      createdAt: new Date().toISOString(),
    };

    await redis.lpush("measurements_list", JSON.stringify(measurement));

    return NextResponse.json(measurement, { status: 201 });
  } catch (error: any) {
    console.error("Error en POST /api/measurements:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const measurementsList = await redis.lrange("measurements_list", 0, -1);

    if (!measurementsList || measurementsList.length === 0) {
      return NextResponse.json([]);
    }

    const measurements = [];
    for (const measurementData of measurementsList) {
      try {
        if (typeof measurementData === "string") {
          const parsed = JSON.parse(measurementData);
          measurements.push(parsed);
        } else if (typeof measurementData === "object" && measurementData !== null) {
          measurements.push(measurementData);
        }
      } catch (parseError) {
        console.error("Error processing measurement:", measurementData, parseError);
      }
    }

    // Ordenar por fecha (más reciente primero)
    measurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(measurements);
  } catch (error: any) {
    console.error("Error en GET /api/measurements:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const measurementId = searchParams.get("id");

    if (!measurementId) {
      return NextResponse.json({ error: "ID de la medición es requerido" }, { status: 400 });
    }

    const measurementsList = await redis.lrange("measurements_list", 0, -1);

    if (!measurementsList || measurementsList.length === 0) {
      return NextResponse.json({ error: "Medición no encontrada" }, { status: 404 });
    }

    let measurementFound = false;
    let measurementToRemove = null;

    for (const measurementData of measurementsList) {
      let measurement;
      try {
        if (typeof measurementData === "string") {
          measurement = JSON.parse(measurementData);
        } else if (typeof measurementData === "object" && measurementData !== null) {
          measurement = measurementData;
        } else {
          continue;
        }

        if (measurement.id === measurementId) {
          measurementFound = true;
          measurementToRemove = typeof measurementData === "string" ? measurementData : JSON.stringify(measurementData);
          break;
        }
      } catch (parseError) {
        console.error("Error parsing measurement during delete:", measurementData, parseError);
        continue;
      }
    }

    if (!measurementFound || !measurementToRemove) {
      return NextResponse.json({ error: "Medición no encontrada" }, { status: 404 });
    }

    const removedCount = await redis.lrem("measurements_list", 0, measurementToRemove);

    if (removedCount === 0) {
      return NextResponse.json({ error: "No se pudo eliminar la medición" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Medición eliminada exitosamente",
      deletedId: measurementId,
    });
  } catch (error: any) {
    console.error("Error en DELETE /api/measurements:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
