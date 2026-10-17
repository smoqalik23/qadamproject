import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, type UIMessage } from "ai";
import type { Database, Json } from "@/integrations/supabase/types";
import { createResponsesCall } from "@/lib/ai/responses.server";

function buildInstructions(p: Record<string, unknown>) {
  const f = (k: string) => String(p[k] ?? "").trim() || "не указано";
  return `Ты — ИИ-продавец компании «${f("company")}» (Тараз, Жамбылская область, Казахстан). Общаешься с клиентами в мессенджерах (WhatsApp, Instagram, Telegram).
Язык: отвечай на том языке, на котором пишет клиент — русском, казахском или смешанном (шала-казахский). Пиши коротко, тепло и по-деловому, как живой менеджер.
Товары и услуги: ${f("products")}
Цены: ${f("prices")} (валюта — тенге, ₸)
Целевая аудитория: ${f("audience")}
Уникальное торговое предложение: ${f("usp")}
Продающие крючки и акции: ${f("hooks")}
Доставка и оплата: ${f("delivery")}
Правила: не выдумывай цены и условия, которых нет выше — предложи уточнить у менеджера. Выявляй потребность, отрабатывай возражения, мягко веди к заказу и просьбе оставить имя и телефон.`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return Response.json({ error: "Войдите в аккаунт" }, { status: 401 });
        const sb = createClient<Database>(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_PUBLISHABLE_KEY"]!,
          {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
          },
        );
        const { data: u } = await sb.auth.getUser(token);
        if (!u.user) return Response.json({ error: "Сессия истекла" }, { status: 401 });
        const body = (await request.json()) as { threadId?: string; messages?: UIMessage[] };
        const threadId = body.threadId;
        const messages = Array.isArray(body.messages) ? body.messages.slice(-60) : [];
        if (!threadId || !messages.length)
          return Response.json({ error: "Неверный запрос" }, { status: 400 });
        const { data: thread } = await sb
          .from("threads")
          .select("id,title")
          .eq("id", threadId)
          .maybeSingle();
        if (!thread) return Response.json({ error: "Диалог не найден" }, { status: 404 });
        const { data: prof } = await sb
          .from("workspace_records")
          .select("data")
          .eq("kind", "bot_profile")
          .limit(1)
          .maybeSingle();
        const last = messages[messages.length - 1]!;
        if (last.role === "user") {
          const { error } = await sb.from("chat_messages").upsert(
            {
              thread_id: threadId,
              user_id: u.user.id,
              message_id: last.id,
              message: last as unknown as Json,
            },
            { onConflict: "thread_id,message_id" },
          );
          if (error)
            return Response.json({ error: "Не удалось сохранить сообщение" }, { status: 500 });
          if (thread.title === "Новый диалог" || !thread.title) {
            const text = last.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join(" ")
              .slice(0, 60);
            if (text) await sb.from("threads").update({ title: text }).eq("id", threadId);
          }
        }
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "ИИ не настроен" }, { status: 500 });
        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages),
          buildInstructions((prof?.data as Record<string, unknown>) ?? {}),
        );
        const res = call.result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: true,
          onFinish: async ({ responseMessage }) => {
            const { error } = await sb.from("chat_messages").upsert(
              {
                thread_id: threadId,
                user_id: u.user.id,
                message_id: responseMessage.id,
                message: responseMessage as unknown as Json,
              },
              { onConflict: "thread_id,message_id" },
            );
            if (error) console.error("save assistant message", error);
          },
        });
        const headers = new Headers(res.headers);
        const runId = call.runIdFetch.getRunId?.();
        if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
        return new Response(res.body, { status: res.status, headers });
      },
    },
  },
});
