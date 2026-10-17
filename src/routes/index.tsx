import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  TrendingUp,
  Users,
  Wallet,
  ShoppingBag,
  ChevronDown,
  Plus,
  ArrowRight,
  Circle,
  Check,
  FileText,
  Bot,
  Store,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/platform-shell";
import { usePlatform, money, demoDeals, stages, stageClasses, routeHead } from "@/lib/platform";
import { useState } from "react";
export const Route = createFileRoute("/")({
  head: () =>
    routeHead(
      "Обзор бизнеса",
      "Продажи, клиенты и задачи вашего бизнеса в одном рабочем пространстве Qadam.",
    ),
  component: Overview,
});
const chart = [
  { name: "1 окт", v: 380, p: 270 },
  { name: "3 окт", v: 550, p: 400 },
  { name: "5 окт", v: 490, p: 380 },
  { name: "7 окт", v: 830, p: 520 },
  { name: "9 окт", v: 720, p: 460 },
  { name: "11 окт", v: 990, p: 670 },
  { name: "13 окт", v: 880, p: 590 },
  { name: "15 окт", v: 1300, p: 770 },
  { name: "17 окт", v: 1140, p: 710 },
  { name: "19 окт", v: 1470, p: 840 },
  { name: "21 окт", v: 1320, p: 890 },
  { name: "23 окт", v: 1740, p: 1030 },
  { name: "25 окт", v: 1600, p: 970 },
  { name: "27 окт", v: 1980, p: 1140 },
  { name: "29 окт", v: 1880, p: 1080 },
  { name: "31 окт", v: 2260, p: 1240 },
];
function Overview() {
  const { user, records, save } = usePlatform();
  const [period, setPeriod] = useState("Октябрь 2026");
  const deals = user ? records.filter((r) => r.kind === "deal") : demoDeals;
  const tasks = records.filter((r) => r.kind === "task");
  const revenue = deals
    .filter((d) => Number(d.data.stage) >= 3 && Number(d.data.stage) < 5)
    .reduce((s, d) => s + Number(d.data.amount), 0);
  const metrics = [
    {
      label: "Выручка",
      value: user ? money(revenue) : "8 450 000 ₸",
      growth: "+18,6%",
      icon: Wallet,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Активные сделки",
      value: user ? String(deals.filter((d) => Number(d.data.stage) < 4).length) : "32",
      growth: "+8",
      icon: TrendingUp,
      color: "text-success bg-success/10",
    },
    {
      label: "Новые клиенты",
      value: user ? String(records.filter((r) => r.kind === "contact").length) : "48",
      growth: "+12,4%",
      icon: Users,
      color: "text-violet bg-violet/10",
    },
    {
      label: "B2B-заказы",
      value: user ? String(records.filter((r) => r.kind === "order").length) : "24",
      growth: "+6",
      icon: ShoppingBag,
      color: "text-warning bg-warning/10",
    },
  ];
  return (
    <>
      <PageHeading title="Обзор бизнеса" subtitle="Всё важное о вашем бизнесе — в одном месте">
        <select
          className="select-control text-xs"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option>Октябрь 2026</option>
          <option>Сентябрь 2026</option>
          <option>Этот год</option>
        </select>
        <Button asChild>
          <Link to="/crm">
            <Plus /> Создать сделку
          </Link>
        </Button>
      </PageHeading>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div className="panel metric" key={m.label}>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">{m.label}</span>
              <span className={"metric-icon " + m.color}>
                <m.icon size={18} />
              </span>
            </div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-foot">
              <span className="text-success flex items-center">
                <ArrowUpRight size={13} />
                {user ? "—" : m.growth}
              </span>
              <span>к прошлому месяцу</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid xl:grid-cols-[1.85fr_1fr] gap-5 mb-6">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2 className="section-title">Динамика продаж</h2>
              <p className="text-muted-foreground text-[11px] mt-1">Выручка за выбранный период</p>
            </div>
            <div className="flex gap-4 text-[10px]">
              <span className="text-primary">● Текущий месяц</span>
              <span className="text-muted-foreground">● Прошлый месяц</span>
            </div>
          </div>
          <div className="px-5 pt-5 h-[260px] pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  user
                    ? chart.map((c) => ({ ...c, v: revenue / 1000 / 16, p: 0 }))
                    : period === "Сентябрь 2026"
                      ? chart.map((c) => ({ ...c, v: c.p, p: c.p * 0.8 }))
                      : chart
                }
              >
                <defs>
                  <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  interval={3}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => (v >= 1000 ? v / 1000 + " млн" : v + " тыс")}
                  width={58}
                />
                <Tooltip formatter={(v) => money(Number(v) * 1000)} />
                <Area
                  type="monotone"
                  dataKey="p"
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                  fill="none"
                  strokeWidth={1.3}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--primary)"
                  fill="url(#fillSales)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t border-border px-6 py-3 flex gap-8 text-[11px]">
            <span className="text-muted-foreground">
              Средний чек{" "}
              <strong className="text-foreground ml-2">
                {user ? money(deals.length ? revenue / deals.length : 0) : "264 063 ₸"}
              </strong>
            </span>
            <span className="text-muted-foreground">
              Конверсия{" "}
              <strong className="text-success ml-2">
                {user
                  ? deals.length
                    ? Math.round(
                        (deals.filter((d) => Number(d.data.stage) === 4).length / deals.length) *
                          100,
                      )
                    : 0
                  : 32}
                %
              </strong>
            </span>
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2 className="section-title">Воронка продаж</h2>
            <Button asChild variant="ghost" size="icon" title="Открыть воронку">
              <Link to="/crm">
                <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <div className="px-6 space-y-5 pb-5">
            {stages.slice(0, 5).map((s, i) => {
              const count = user
                ? deals.filter((d) => Number(d.data.stage) === i).length
                : [18, 12, 8, 6, 5][i];
              return (
                <div key={s}>
                  <div className="flex justify-between text-[11px] mb-2">
                    <span>{s}</span>
                    <span className="font-bold">
                      {count} <span className="text-muted-foreground font-normal">сделок</span>
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-sm overflow-hidden">
                    <div
                      className={
                        [
                          "bg-primary/45 w-full",
                          "bg-primary/60 w-4/5",
                          "bg-primary/75 w-3/5",
                          "bg-primary w-2/5",
                          "bg-success w-1/3",
                        ][i] + " h-full"
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-border px-6 py-3 flex justify-between text-[11px]">
            <span className="text-muted-foreground">Всего в работе</span>
            <strong>
              {user ? money(deals.reduce((s, d) => s + Number(d.data.amount), 0)) : "12 680 000 ₸"}
            </strong>
          </div>
        </section>
      </div>
      <div className="grid xl:grid-cols-[1.85fr_1fr] gap-5">
        <section className="panel overflow-hidden">
          <div className="panel-head">
            <h2 className="section-title">
              Последние сделки{" "}
              <span className="text-muted-foreground font-normal text-xs ml-2">{deals.length}</span>
            </h2>
            <Button asChild variant="link" size="sm">
              <Link to="/crm">
                Все сделки <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="overflow-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>СДЕЛКА / КОМПАНИЯ</th>
                  <th>СУММА</th>
                  <th>ЭТАП</th>
                  <th>ОТВЕТСТВЕННЫЙ</th>
                </tr>
              </thead>
              <tbody>
                {deals.slice(0, 5).map((d) => (
                  <tr key={d.id}>
                    <td>
                      <Link to="/crm" className="font-semibold block hover:text-primary">
                        {String(d.data.title)}
                      </Link>
                      <span className="text-muted-foreground text-[10px]">
                        {String(d.data.company)}
                      </span>
                    </td>
                    <td className="font-semibold whitespace-nowrap">
                      {money(Number(d.data.amount))}
                    </td>
                    <td>
                      <span className={"tag " + stageClasses[Number(d.data.stage)]}>
                        {stages[Number(d.data.stage)]}
                      </span>
                    </td>
                    <td>
                      <span className="flex items-center gap-2">
                        <span className="avatar-chip">{String(d.data.manager).slice(0, 2)}</span>
                        {String(d.data.manager)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!deals.length && <p className="p-8 text-muted-foreground">Сделок пока нет</p>}
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2 className="section-title">
              Задачи на сегодня <span className="tag ml-2">{user ? tasks.length : 4}</span>
            </h2>
            <Button asChild variant="ghost" size="icon" title="Добавить задачу">
              <Link to="/tasks">
                <Plus />
              </Link>
            </Button>
          </div>
          {(user
            ? tasks
            : [
                {
                  id: "t1",
                  kind: "task",
                  data: {
                    title: "Позвонить Ерлану по поставке",
                    time: "10:00",
                    company: "ТОО «Тараз Строй»",
                    done: false,
                  },
                },
                {
                  id: "t2",
                  kind: "task",
                  data: {
                    title: "Отправить коммерческое предложение",
                    time: "12:30",
                    company: "ИП «Береке»",
                    done: false,
                  },
                },
                {
                  id: "t3",
                  kind: "task",
                  data: {
                    title: "Подготовить договор поставки",
                    time: "14:00",
                    company: "ТОО «Coffee Lab»",
                    done: false,
                  },
                },
                {
                  id: "t4",
                  kind: "task",
                  data: {
                    title: "Согласовать условия доставки",
                    time: "16:00",
                    company: "ТОО «Дастархан»",
                    done: true,
                  },
                },
              ]
          )
            .slice(0, 4)
            .map((t) => (
              <div className="task-row" key={t.id}>
                <input
                  aria-label={"Выполнить " + t.data.title}
                  type="checkbox"
                  checked={Boolean(t.data.done)}
                  onChange={() =>
                    save("task", { ...t.data, done: !t.data.done }, user ? t.id : undefined)
                  }
                  className="mt-1 accent-primary"
                />
                <div className="flex-1">
                  <div
                    className={
                      "text-[11px] font-semibold " +
                      (t.data.done ? "line-through text-muted-foreground" : "")
                    }
                  >
                    {String(t.data.title)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {String(t.data.company || "")}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {String(t.data.time || "")}
                </span>
              </div>
            ))}
          <Button asChild variant="link" className="w-full text-xs mt-1">
            <Link to="/tasks">
              Все задачи <ArrowRight />
            </Link>
          </Button>
        </section>
      </div>
      <h2 className="section-title mt-7 mb-4">Инструменты для роста</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            to: "/marketplace" as const,
            icon: Store,
            title: "B2B-маркетплейс",
            text: "Найдите поставщиков в вашем регионе",
            color: "text-success bg-success/10",
          },
          {
            to: "/documents" as const,
            icon: FileText,
            title: "Документы за минуты",
            text: "Договоры, счета и акты для вашего бизнеса",
            color: "text-primary bg-primary/10",
          },
          {
            to: "/bot" as const,
            icon: Bot,
            title: "Ваш ИИ-продавец",
            text: "Больше продаж. Меньше рутины.",
            color: "text-violet bg-violet/10",
          },
        ].map((t) => (
          <Link
            to={t.to}
            className="panel p-4 flex items-center gap-3 hover:border-primary transition-colors"
            key={t.to}
          >
            <span className={"metric-icon " + t.color}>
              <t.icon size={19} />
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-xs">{t.title}</h3>
              <p className="text-muted-foreground text-[10px] mt-1">{t.text}</p>
            </div>
            <ArrowUpRight size={17} className="text-muted-foreground" />
          </Link>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-5">
        {!user && "Демонстрационный обзор · Войдите, чтобы работать с данными своей компании"}
      </p>
    </>
  );
}
