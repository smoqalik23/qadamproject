import { createFileRoute } from '@tanstack/react-router';
import { Tasks } from '@/components/crm-pages';
import { routeHead } from '@/lib/platform';
export const Route=createFileRoute('/tasks')({head:()=>routeHead('Задачи','Поручения и напоминания для вашей команды'),component:Tasks});
