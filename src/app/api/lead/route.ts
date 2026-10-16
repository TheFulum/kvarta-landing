import { parseLead } from "@/lib/lead";
import { getLeadStore } from "@/lib/lead-store";

const MAX_BODY = 16_000;

/**
 * Ответы, на которые опирается форма:
 * 201 created · 200 duplicate (заявка с этого номера уже есть, не ошибка)
 * 422 validation + fields · 400 bad_request · 413 too_large · 503 server
 */
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) {
    return Response.json({ ok: false, error: "too_large" }, { status: 413 });
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return Response.json({ ok: false, error: "too_large" }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const parsed = parseLead(body);
  if (!parsed.ok) {
    const hasFields = Object.keys(parsed.fields).length > 0;
    return hasFields
      ? Response.json({ ok: false, error: "validation", fields: parsed.fields }, { status: 422 })
      : Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // бот заполнил ловушку: отвечаем как обычно, но ничего не сохраняем
  if (parsed.bot) return Response.json({ ok: true, status: "created" }, { status: 201 });

  try {
    const store = await getLeadStore();
    const result = await store.save({ ...parsed.lead, userAgent: request.headers.get("user-agent") ?? undefined });
    return Response.json(
      { ok: true, status: result.status },
      { status: result.status === "created" ? 201 : 200 },
    );
  } catch (error) {
    console.error("[lead] не удалось сохранить заявку", error);
    return Response.json({ ok: false, error: "server" }, { status: 503 });
  }
}
