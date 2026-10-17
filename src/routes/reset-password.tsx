import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { routeHead } from '@/lib/platform';
export const Route=createFileRoute('/reset-password')({head:()=>routeHead('Новый пароль','Восстановление доступа к аккаунту Qadam.'),component:Reset});
function Reset(){const [password,setPassword]=useState('');const [error,setError]=useState('');const navigate=Route.useNavigate();return <form className="max-w-md mx-auto py-20 space-y-5" onSubmit={async e=>{e.preventDefault();const {error}=await supabase.auth.updateUser({password});if(error)setError('Ссылка недействительна или истекла. Запросите новое письмо.');else navigate({to:'/'})}}><h1 className="text-2xl font-bold">Новый пароль</h1><label className="field">Пароль<input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className="text-destructive">{error}</p>}<Button>Сохранить пароль</Button></form>}
