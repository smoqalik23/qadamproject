import { createFileRoute } from '@tanstack/react-router';
import { CRM } from '@/components/crm-pages';
import { routeHead } from '@/lib/platform';
export const Route=createFileRoute('/crm')({head:()=>routeHead('Воронка продаж','Управление сделками и этапами продаж'),component:CRM});
