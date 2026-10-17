import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type RecordData = {
  id: string;
  kind: string;
  data: Record<string, string | number | boolean> &
    Partial<
      Record<
        | "title"
        | "name"
        | "company"
        | "amount"
        | "stage"
        | "contact"
        | "source"
        | "manager"
        | "due"
        | "note"
        | "phone"
        | "email"
        | "tags"
        | "done"
        | "time"
        | "bin"
        | "address"
        | "iban"
        | "quantity"
        | "status"
        | "content"
        | "date",
        string | number | boolean
      >
    >;
};
const PlatformContext = createContext<{
  user: User | null;
  records: RecordData[];
  ready: boolean;
  refresh: () => Promise<void>;
  save: (kind: string, data: RecordData["data"], id?: string) => Promise<string | undefined>;
  remove: (id: string) => Promise<void>;
}>({
  user: null,
  records: [],
  ready: false,
  refresh: async () => {},
  save: async () => undefined,
  remove: async () => {},
});
export function PlatformProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<RecordData[]>([]);
  const [ready, setReady] = useState(false);
  async function refresh() {
    const { data, error } = await supabase
      .from("workspace_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Не удалось загрузить данные");
      return;
    }
    setRecords(
      (data ?? []).map((r) => ({ id: r.id, kind: r.kind, data: r.data as RecordData["data"] })),
    );
  }
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (user) void refresh();
    else setRecords([]);
  }, [user]);
  async function save(kind: string, data: RecordData["data"], id?: string) {
    if (!user) {
      toast.error("Войдите в аккаунт, чтобы сохранить данные");
      return;
    }
    const result = id
      ? await supabase
          .from("workspace_records")
          .update({ data: data as Json })
          .eq("id", id)
          .select()
          .single()
      : await supabase
          .from("workspace_records")
          .insert({ kind, data: data as Json, user_id: user.id })
          .select()
          .single();
    if (result.error) {
      toast.error("Не удалось сохранить: " + result.error.message);
      return;
    }
    await refresh();
    toast.success("Сохранено");
    return result.data.id;
  }
  async function remove(id: string) {
    const { error } = await supabase.from("workspace_records").delete().eq("id", id);
    if (error) toast.error(error.message);
    else await refresh();
  }
  return (
    <PlatformContext.Provider value={{ user, records, ready, refresh, save, remove }}>
      {children}
    </PlatformContext.Provider>
  );
}
export const usePlatform = () => useContext(PlatformContext);
export const money = (value: number) => new Intl.NumberFormat("ru-KZ").format(value) + " ₸";
export const stages = ["Новая заявка", "В работе", "Предложение", "Оплачено", "Успешно", "Отказ"];
export const stageClasses = ["tag-blue", "tag-orange", "tag-violet", "tag-green", "tag-green", ""];
export const demoDeals: RecordData[] = [
  {
    id: "demo1",
    kind: "deal",
    data: {
      title: "Поставка строительных материалов",
      company: "ТОО «Тараз Строй»",
      amount: 1250000,
      stage: 1,
      contact: "Ерлан Садыков",
      source: "B2B-маркетплейс",
      manager: "Айгерим",
      due: "2026-10-15",
      note: "",
    },
  },
  {
    id: "demo2",
    kind: "deal",
    data: {
      title: "Оптовая закупка муки",
      company: "ИП «Береке»",
      amount: 480000,
      stage: 2,
      contact: "Марат Алиев",
      source: "WhatsApp",
      manager: "Данияр",
      due: "2026-10-14",
      note: "",
    },
  },
  {
    id: "demo3",
    kind: "deal",
    data: {
      title: "Оборудование для кофейни",
      company: "ТОО «Coffee Lab»",
      amount: 890000,
      stage: 0,
      contact: "Алия Нурлан",
      source: "Сайт",
      manager: "Айгерим",
      due: "2026-10-16",
      note: "",
    },
  },
  {
    id: "demo4",
    kind: "deal",
    data: {
      title: "Поставка продуктов питания",
      company: "ТОО «Дастархан»",
      amount: 320000,
      stage: 3,
      contact: "Руслан Омаров",
      source: "Instagram",
      manager: "Данияр",
      due: "2026-10-13",
      note: "",
    },
  },
  {
    id: "demo5",
    kind: "deal",
    data: {
      title: "Услуги грузоперевозки",
      company: "ИП «Жол»",
      amount: 175000,
      stage: 4,
      contact: "Нурлан Асан",
      source: "B2B-маркетплейс",
      manager: "Айгерим",
      due: "2026-10-13",
      note: "",
    },
  },
];
export function routeHead(title: string, description: string) {
  return {
    meta: [
      { title: title + " — Qadam" },
      { name: "description", content: description },
      { property: "og:title", content: title + " — Qadam" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
