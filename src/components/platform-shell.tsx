import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Columns3,
  Users,
  Store,
  FileText,
  Bot,
  CheckSquare,
  MessageSquare,
  ChevronDown,
  Search,
  Bell,
  Menu,
  ArrowUpRight,
  Sun,
  Moon,
  LogOut,
  CircleHelp,
  Plus,
  X,
  ArrowRight,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePlatform } from "@/lib/platform";
import { supabase } from "@/integrations/supabase/client";
const links = [
  { to: "/" as const, label: "Обзор", icon: LayoutDashboard },
  { to: "/crm" as const, label: "Воронка продаж", icon: Columns3 },
  { to: "/contacts" as const, label: "Клиенты", icon: Users },
  { to: "/tasks" as const, label: "Задачи", icon: CheckSquare },
  { to: "/marketplace" as const, label: "B2B-маркетплейс", icon: Store },
  { to: "/documents" as const, label: "Документы", icon: FileText },
  { to: "/bot" as const, label: "ИИ-продавец", icon: Bot },
  { to: "/messages" as const, label: "Сообщения", icon: MessageSquare },
];
export function PlatformShell({ children }: { children: React.ReactNode }) {
  const path = useLocation({ select: (l) => l.pathname });
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const { user, records } = usePlatform();
  return (
    <div className="app-shell">
      <aside className={"app-sidebar " + (open ? "open" : "")}>
        <Link to="/" className="brand">
          <span className="brand-mark">
            <ArrowUpRight strokeWidth={3} />
          </span>
          qadam<span className="text-primary">.</span>
        </Link>
        <div className="relative mx-4 mb-4">
          <button
            type="button"
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            aria-expanded={workspaceOpen}
            className="w-full rounded-md border border-border p-3 flex items-center gap-2 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="avatar-chip">Б</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-foreground">Мой бизнес</div>
              <div className="text-[10px] text-muted-foreground">Тараз, Казахстан</div>
            </div>
            <ChevronDown
              size={14}
              className={workspaceOpen ? "rotate-180 transition-transform" : "transition-transform"}
            />
          </button>

          {workspaceOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-lg border border-border bg-background text-foreground p-2 shadow-xl">
              <div className="px-3 py-2">
                <div className="font-semibold text-sm">Мой бизнес</div>
                <div className="text-xs text-muted-foreground">Тараз, Казахстан</div>
              </div>

              <div className="h-px bg-border my-1" />

              <Link
                to="/settings"
                onClick={() => setWorkspaceOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <Settings size={16} />
                Настройки бизнеса
              </Link>

              {user ? (
                <button
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.auth.signOut();

                    if (!error) {
                      setWorkspaceOpen(false);
                      window.location.href = "/login";
                    }
                  }}
                  className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <LogOut size={16} />
                  Выйти из аккаунта
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setWorkspaceOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <ArrowRight size={16} />
                  Войти в аккаунт
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav>
          {links.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={
                "nav-link " +
                (path === l.to || (l.to === "/bot" && path.startsWith("/chat/")) ? "active" : "")
              }
            >
              <l.icon />
              <span className="flex-1">{l.label}</span>
              {i === 3 && (
                <span className="tag tag-orange">
                  {records.filter((r) => r.kind === "task" && !r.data.done).length || 4}
                </span>
              )}
              {i === 7 && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <div className="bg-primary/5 border border-primary/10 rounded-md p-4">
            <div className="flex gap-2 text-primary items-center font-bold">
              <Bot size={18} /> Ваш бизнес. На шаг впереди.
            </div>
            <p className="text-muted-foreground text-[11px] leading-5 mt-2">
              Новые возможности для предпринимателей Жамбылской области
            </p>
            <Button asChild variant="link" className="px-0 mt-1 h-7 text-xs">
              <Link to="/bot">
                Настроить ИИ-продавца <ArrowRight size={13} />
              </Link>
            </Button>
          </div>
          <Button
            asChild
            variant="ghost"
            className="mt-3 w-full justify-start text-muted-foreground"
          >
            <Link to="/settings">
              <CircleHelp /> Настройки
            </Link>
          </Button>
        </div>
        <div className="border-t border-border p-4 flex gap-3 items-center">
          <div className="avatar-chip bg-primary/10 text-primary">
            {user?.email?.slice(0, 2).toUpperCase() || "МБ"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold truncate">{user ? "Мой аккаунт" : "Гостевой просмотр"}</div>
            <div className="text-[10px] text-muted-foreground truncate">
              {user?.email || "Демонстрационные данные"}
            </div>
          </div>
          {user ? (
            <Button
              size="icon"
              variant="ghost"
              title="Выйти"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut size={15} />
            </Button>
          ) : (
            <Button asChild size="icon" variant="ghost" title="Войти">
              <Link to="/login">
                <ArrowRight size={15} />
              </Link>
            </Button>
          )}
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <Button
              className="mobile-menu"
              variant="ghost"
              size="icon"
              aria-label="Меню"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
            <div className="hidden md:flex text-muted-foreground text-xs gap-2">
              Рабочее пространство <span>/</span>
              <span className="text-foreground">
                {links.find((l) => l.to === path)?.label || "Настройки"}
              </span>
            </div>
          </div>
          <div className="flex gap-3 items-center relative">
            <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
              <Search size={15} />
              <input
                aria-label="Поиск по рабочему пространству"
                placeholder="Поиск по рабочему пространству"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="outline-none bg-transparent w-56 text-xs"
              />
            </div>
            {search && (
              <div className="absolute top-12 right-20 w-72 panel p-3 z-40">
                {records
                  .filter((r) =>
                    JSON.stringify(r.data).toLowerCase().includes(search.toLowerCase()),
                  )
                  .slice(0, 5)
                  .map((r) => (
                    <div key={r.id} className="p-2 border-b border-border">
                      {String(r.data.title || r.data.name || r.kind)}
                    </div>
                  ))}
                {!records.some((r) =>
                  JSON.stringify(r.data).toLowerCase().includes(search.toLowerCase()),
                ) && "Ничего не найдено"}
              </div>
            )}
            <span className="hidden sm:block text-muted-foreground text-xs border-l border-border pl-4">
              Тараз <ChevronDown className="inline ml-1" size={12} />
            </span>
            <Button
              variant="ghost"
              size="icon"
              title={dark ? "Светлая тема" : "Тёмная тема"}
              onClick={() => {
                document.documentElement.classList.toggle("dark");
                setDark(!dark);
              }}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Уведомления"
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={18} />
            </Button>
            {notifications && (
              <div className="absolute right-0 top-12 panel p-5 z-40 w-72">
                <h3 className="font-bold">Уведомления</h3>
                <p className="mt-3 text-muted-foreground">
                  {records.filter((r) => r.kind === "task" && !r.data.done).length} задач ожидают
                  выполнения
                </p>
              </div>
            )}
            <span className="tag tag-blue hidden sm:inline-flex">РУС</span>
          </div>
        </header>
        <main className="workspace">{children}</main>
      </div>
    </div>
  );
}
export function PageHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="flex gap-2 items-center">{children}</div>
    </div>
  );
}
