import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { ArrowLeft, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { routeHead, usePlatform } from '@/lib/platform';

export const Route = createFileRoute('/chat/$threadId')({ head: () => routeHead('Диалог с ИИ-продавцом', 'Тестовый диалог с ИИ-продавцом вашей компании.'), component: ChatPage });

function ChatPage() {
  const { threadId } = Route.useParams();
  const { user, ready } = usePlatform();
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  useEffect(() => {
    if (!user) return;
    setInitial(null);
    supabase.from('chat_messages').select('message').eq('thread_id', threadId).order('created_at').then(({ data, error }) => {
      if (error) toast.error('Не удалось загрузить диалог');
      setInitial((data ?? []).map((r) => r.message as unknown as UIMessage));
    });
  }, [threadId, user]);
  if (ready && !user) return <p className="p-8 text-muted-foreground"><Link to="/login" className="text-primary">Войдите</Link>, чтобы открыть диалог.</p>;
  if (!initial) return <p className="p-8 text-muted-foreground">Загрузка диалога…</p>;
  return <ChatWindow key={threadId} threadId={threadId} initial={initial} />;
}

function ChatWindow({ threadId, initial }: { threadId: string; initial: UIMessage[] }) {
  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/chat',
    body: { threadId },
    headers: async (): Promise<Record<string, string>> => { const { data } = await supabase.auth.getSession(); return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {}; },
  }), [threadId]);
  const { messages, sendMessage, status, stop } = useChat({ id: threadId, messages: initial, transport, onError: (e) => toast.error(e.message.includes('402') ? 'Закончились ИИ-кредиты' : e.message.includes('429') ? 'Слишком много запросов, попробуйте позже' : 'Ошибка ИИ: ' + e.message) });
  const busy = status === 'submitted' || status === 'streaming';
  const lastAssistantEmpty = !messages.length || messages[messages.length - 1]!.role === 'user';
  return <div className="flex flex-col h-[calc(100dvh-140px)]">
    <div className="flex items-center gap-2 mb-3"><Button asChild variant="ghost" size="icon" title="Назад"><Link to="/bot"><ArrowLeft /></Link></Button><span className="brand-mark"><Store size={16} /></span><div><div className="font-bold">ИИ-продавец</div><div className="text-[11px] text-muted-foreground">Пишите как клиент — по-русски или по-казахски</div></div></div>
    <Conversation className="flex-1 panel">
      <ConversationContent>
        {!messages.length && <ConversationEmptyState title="Начните диалог" description="Например: «Сәлеметсіз бе, мука бар ма? Сколько стоит мешок?»" />}
        {messages.map((m) => <Message key={m.id} from={m.role}><MessageContent>{m.parts.map((p, i) => p.type === 'text' ? <MessageResponse key={i}>{p.text}</MessageResponse> : null)}</MessageContent></Message>)}
        {busy && lastAssistantEmpty && <Shimmer>Продавец печатает…</Shimmer>}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
    <PromptInput className="mt-3" onSubmit={(msg) => { if (msg.text.trim() && !busy) void sendMessage({ text: msg.text }); }}>
      <PromptInputTextarea autoFocus placeholder="Сообщение клиента…" />
      <PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={stop} /></PromptInputFooter>
    </PromptInput>
  </div>;
}
