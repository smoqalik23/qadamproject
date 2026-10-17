import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeading } from "@/components/platform-shell";
import { Button } from "@/components/ui/button";
import { usePlatform, routeHead } from "@/lib/platform";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/bot")({
  head: () =>
    routeHead(
      "ИИ-продавец",
      "Настройте ИИ-продавца для WhatsApp и Instagram: товары, цены, аудитория и продающие крючки.",
    ),
  component: Bot,
});

const fields = [
  ["company", "Название компании", "Например: ТОО «Береке»"],
  ["products", "Какие товары или услуги вы продаёте?", "Мука высшего сорта, отруби, крупы…"],
  ["prices", "Цены и условия", "Мука 50 кг — 9 500 ₸, опт от 20 мешков — скидка 5%"],
  ["audience", "Кто ваши клиенты?", "Пекарни, магазины, кафе Тараза"],
  ["usp", "Чем вы лучше конкурентов?", "Собственная мельница, доставка в день заказа"],
  ["hooks", "Продающие крючки и акции", "Первая доставка бесплатно, пробный мешок"],
  ["delivery", "Доставка и оплата", "Доставка по Таразу, Kaspi, безнал"],
] as const;

type Thread = { id: string; title: string; created_at: string };

function Bot() {
  const { user, records, save } = usePlatform();
  const nav = useNavigate();
  const existing = records.find((r) => r.kind === "bot_profile");
  const [form, setForm] = useState<Record<string, string>>({});
  const [threads, setThreads] = useState<Thread[]>([]);
  useEffect(() => {
    if (existing)
      setForm(Object.fromEntries(Object.entries(existing.data).map(([k, v]) => [k, String(v)])));
  }, [existing?.id]);
  async function load() {
    const { data, error } = await supabase
      .from("threads")
      .select("id,title,created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error("Не удалось загрузить диалоги");
    else setThreads(data ?? []);
  }
  useEffect(() => {
    if (user) void load();
  }, [user]);
  async function newThread() {
    if (!user) {
      toast.error("Войдите в аккаунт, чтобы начать диалог");
      return;
    }
    const { data, error } = await supabase
      .from("threads")
      .insert({ user_id: user.id, title: "Новый диалог" })
      .select("id")
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    void nav({ to: "/chat/$threadId", params: { threadId: data.id } });
  }
  return (
    <>
      <PageHeading
        title="ИИ-продавец"
        subtitle="Отвечает клиентам 24/7 на русском и казахском языках"
      >
        <Button onClick={newThread}>
          <Plus /> Тестовый диалог
        </Button>
      </PageHeading>
      {!user && (
        <div className="panel p-4 mb-5 text-muted-foreground">
          Это гостевой режим.{" "}
          <Link to="/login" className="text-primary font-bold">
            Войдите
          </Link>
          , чтобы настроить продавца и сохранять диалоги.
        </div>
      )}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <form
          className="panel p-5 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await save("bot_profile", form, existing?.id);
          }}
        >
          <h2 className="section-title">Интервью о вашем бизнесе</h2>
          <p className="text-muted-foreground text-xs">
            Чем подробнее ответы, тем лучше ИИ продаёт. Эти данные используются в каждом диалоге.
          </p>
          {fields.map(([n, l, ph]) => (
            <label key={n} className="field">
              {l}
              <textarea
                placeholder={ph}
                value={form[n] ?? ""}
                required={n === "company" || n === "products"}
                onChange={(e) => setForm({ ...form, [n]: e.target.value })}
              />
            </label>
          ))}
          <Button type="submit">Сохранить профиль продавца</Button>
        </form>
        <aside className="panel p-4">
          <h2 className="section-title mb-3">Диалоги</h2>
          {threads.map((t) => (
            <div key={t.id} className="flex items-center gap-1 mb-1">
              <Button asChild variant="ghost" className="flex-1 justify-start min-w-0">
                <Link to="/chat/$threadId" params={{ threadId: t.id }}>
                  <MessageSquare />
                  <span className="truncate">{t.title}</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Удалить диалог"
                onClick={async () => {
                  const { error } = await supabase.from("threads").delete().eq("id", t.id);
                  if (error) toast.error(error.message);
                  else void load();
                }}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          {!threads.length && (
            <p className="text-muted-foreground text-xs">
              Диалогов пока нет. Начните тестовый диалог и напишите как клиент.
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
