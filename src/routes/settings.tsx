import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeading } from '@/components/platform-shell';
import { Field } from '@/components/crm-pages';
import { routeHead,usePlatform } from '@/lib/platform';
export const Route=createFileRoute('/settings')({head:()=>routeHead('Настройки компании','Реквизиты и настройки вашего рабочего пространства.'),component:Settings});
function Settings(){const {records,save}=usePlatform();const old=records.find(r=>r.kind==='company');const [form,setForm]=useState({name:String(old?.data.name||''),bin:String(old?.data.bin||''),address:String(old?.data.address||''),iban:String(old?.data.iban||''),phone:String(old?.data.phone||'')});return <><PageHeading title="Настройки компании" subtitle="Реквизиты для документов и B2B-каталога"/><form className="max-w-2xl space-y-5" onSubmit={e=>{e.preventDefault();save('company',form,old?.id)}}>{([['Название компании','name'],['БИН / ИИН','bin'],['Адрес','address'],['Банковский счёт (IBAN)','iban'],['Телефон','phone']] as const).map(([l,n])=><Field key={n} label={l} name={n} value={form[n as keyof typeof form]} onChange={(n,v)=>setForm({...form,[n]:v})}/>)}<Button>Сохранить настройки</Button></form></>}
