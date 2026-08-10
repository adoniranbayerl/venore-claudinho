import type { BroadcastOutputEvent } from "../contracts/types";

// Pub/sub em memória, por processo — não é uma feature (sem handler/service/store/authorizeActor,
// é infraestrutura de runtime, mesmo espírito do buffer de log em observability/). Assume um único
// processo Node de longa duração (o plano do plugin é rodar num servidor local, não serverless
// multi-instância) — se isso mudar no futuro, isto precisa virar Redis pub/sub ou equivalente;
// registrado como suposição, não como Known Gap ainda, porque bate com o requisito atual.
type Subscriber = (event: BroadcastOutputEvent) => void;

// Guardado em globalThis, não numa variável de módulo comum — bug real observado: uma server
// action (setOutputPlaylist/setOutputDrawer) e a rota SSE (app/api/broadcast/output/[token]/events)
// ficam em "camadas" de bundle diferentes no Next.js (Server Action vs. Route Handler), e cada
// camada pode acabar com sua PRÓPRIA cópia avaliada deste módulo — duas Maps diferentes, uma
// nunca vendo os subscribers da outra, evento publicado nunca chega no SSE. globalThis é o único
// objeto garantidamente compartilhado entre todas as camadas dentro do mesmo processo Node (mesmo
// truque já usado pra singleton de client de banco em apps Next.js).
type OutputBusGlobal = typeof globalThis & {
  __broadcastOutputSubscribers?: Map<string, Set<Subscriber>>;
};

function getSubscribersByToken(): Map<string, Set<Subscriber>> {
  const globalWithBus = globalThis as OutputBusGlobal;
  if (!globalWithBus.__broadcastOutputSubscribers) {
    globalWithBus.__broadcastOutputSubscribers = new Map();
  }
  return globalWithBus.__broadcastOutputSubscribers;
}

export function subscribeToOutputEvents(token: string, subscriber: Subscriber): () => void {
  const subscribersByToken = getSubscribersByToken();
  const subscribers = subscribersByToken.get(token) ?? new Set<Subscriber>();
  subscribers.add(subscriber);
  subscribersByToken.set(token, subscribers);

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) {
      subscribersByToken.delete(token);
    }
  };
}

export function publishOutputEvent(token: string, event: BroadcastOutputEvent): void {
  const subscribers = getSubscribersByToken().get(token);
  if (!subscribers) return;
  for (const subscriber of subscribers) subscriber(event);
}
