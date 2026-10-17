import { createFileRoute } from "@tanstack/react-router";
import { Contacts } from "@/components/crm-pages";
import { routeHead } from "@/lib/platform";
export const Route = createFileRoute("/contacts")({
  head: () => routeHead("Клиенты", "Контакты и история клиентов Казахстана"),
  component: Contacts,
});
