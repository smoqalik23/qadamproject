import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { routeHead, usePlatform } from "@/lib/platform";
import { Field } from "@/components/crm-pages";
import { toast } from "sonner";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
export const Route = createFileRoute("/login")({
  head: () => routeHead("Вход в аккаунт", "Войдите в Qadam для управления данными своего бизнеса."),
  component: Login,
});
function Login() {
  const { user } = usePlatform();
  const navigate = Route.useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <div className="max-w-md mx-auto py-12">
      <div className="brand justify-center">
        <span className="brand-mark">
          <ArrowUpRight />
        </span>
        qadam.
      </div>
      <h1 className="text-2xl font-bold text-center">
        {user
          ? "Вы вошли в аккаунт"
          : mode === "signup"
            ? "Создайте аккаунт"
            : mode === "reset"
              ? "Восстановить пароль"
              : "С возвращением"}
      </h1>
      <p className="text-muted-foreground text-center mt-2 mb-8">
        Ваше рабочее пространство для роста бизнеса
      </p>
      {user ? (
        <Button className="w-full" onClick={() => navigate({ to: "/" })}>
          Перейти к обзору
        </Button>
      ) : (
        <>
          <Button
            className="w-full mb-5"
            variant="outline"
            onClick={async () => {
              const result = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin,
              });
              if (result.error) toast.error(result.error.message);
              else if (!result.redirected) navigate({ to: "/" });
            }}
          >
            Продолжить с Google
          </Button>
          <div className="text-center text-muted-foreground mb-5 text-xs">
            или по электронной почте
          </div>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setNotice("");
              try {
                if (mode === "reset") {
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + "/reset-password",
                  });
                  if (error) throw error;
                  setNotice("Письмо для восстановления отправлено. Проверьте почту.");
                } else if (mode === "signup") {
                  const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { emailRedirectTo: window.location.origin + "/login" },
                  });
                  if (error) throw error;
                  if (data.session) navigate({ to: "/" });
                  else setNotice("Подтвердите электронную почту по ссылке в письме.");
                } else {
                  const { error } = await supabase.auth.signInWithPassword({ email, password });
                  if (error) throw error;
                  navigate({ to: "/" });
                }
              } catch (e) {
                setNotice(e instanceof Error ? e.message : "Не удалось войти");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field
              label="Электронная почта"
              name="email"
              type="email"
              required
              value={email}
              onChange={(_, v) => setEmail(v)}
            />
            {mode !== "reset" && (
              <label className="field">
                Пароль
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            )}
            {notice && (
              <p role="status" className="text-xs text-primary">
                {notice}
              </p>
            )}
            <Button className="w-full" disabled={busy}>
              {busy
                ? "Подождите…"
                : mode === "signup"
                  ? "Зарегистрироваться"
                  : mode === "reset"
                    ? "Отправить письмо"
                    : "Войти"}
            </Button>
          </form>
          <div className="flex justify-center mt-4">
            <Button
              variant="link"
              onClick={() => {
                setMode(mode === "signup" ? "login" : "signup");
                setNotice("");
              }}
            >
              {mode === "signup" ? "Уже есть аккаунт? Войти" : "Создать аккаунт"}
            </Button>
          </div>
          <Button
            variant="link"
            className="w-full text-muted-foreground"
            onClick={() => setMode(mode === "reset" ? "login" : "reset")}
          >
            {mode === "reset" ? "Вернуться ко входу" : "Забыли пароль?"}
          </Button>
        </>
      )}
      <div className="flex justify-center gap-2 text-muted-foreground text-xs mt-6">
        <ShieldCheck size={15} /> Данные вашего бизнеса защищены
      </div>
    </div>
  );
}
