import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.date) {
      return NextResponse.json({ error: "Faltan campos requeridos: title y date" }, { status: 400 });
    }

    const event = {
      id: Date.now().toString(),
      ...body,
    };

    await redis.lpush("events_list", JSON.stringify(event));

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("Error en POST /api/events:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const eventsList = await redis.lrange("events_list", 0, -1);

    if (!eventsList || eventsList.length === 0) {
      return NextResponse.json([]);
    }

    const events = [];
    for (const eventData of eventsList) {
      console.log("Processing event data:", eventData, "Type:", typeof eventData);

      try {
        if (typeof eventData === "string") {
          const parsed = JSON.parse(eventData);
          events.push(parsed);
        } else if (typeof eventData === "object" && eventData !== null) {
          events.push(eventData);
        } else {
          console.log("Unknown data type:", typeof eventData);
        }
      } catch (parseError) {
        console.error("Error processing event:", eventData, parseError);
      }
    }

    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log("Final events array:", events);

    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Error en GET /api/events:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("id");

    if (!eventId) {
      return NextResponse.json({ error: "ID del evento es requerido" }, { status: 400 });
    }

    const eventsList = await redis.lrange("events_list", 0, -1);

    if (!eventsList || eventsList.length === 0) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    let eventFound = false;
    let eventToRemove = null;

    for (const eventData of eventsList) {
      let event;
      try {
        if (typeof eventData === "string") {
          event = JSON.parse(eventData);
        } else if (typeof eventData === "object" && eventData !== null) {
          event = eventData;
        } else {
          continue;
        }

        if (event.id === eventId) {
          eventFound = true;
          eventToRemove = typeof eventData === "string" ? eventData : JSON.stringify(eventData);
          break;
        }
      } catch (parseError) {
        console.error("Error parsing event during delete:", eventData, parseError);
        continue;
      }
    }

    if (!eventFound || !eventToRemove) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const removedCount = await redis.lrem("events_list", 0, eventToRemove);

    if (removedCount === 0) {
      return NextResponse.json({ error: "No se pudo eliminar el evento" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Evento eliminado exitosamente",
      deletedId: eventId,
    });
  } catch (error: any) {
    console.error("Error en DELETE /api/events:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
