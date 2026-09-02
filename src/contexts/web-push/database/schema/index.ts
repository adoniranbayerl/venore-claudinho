import { pgSchema, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const webPushSchema = pgSchema("web_push");

// Uma inscrição Web Push por (endpoint) — o endpoint é a URL única que o navegador dá pra aquele
// device+navegador. `actorId` é texto solto, sem FK pra auth.users (mesmo critério dos outros
// contexts: FK cross-schema é evitada, a integridade é da aplicação). p256dh/auth são as chaves
// do PushSubscription serializado. Inscrições mortas (410/404 ao enviar) são removidas por
// send-push/service.ts.
export const pushSubscriptions = webPushSchema.table(
  "push_subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    actorId: text("actor_id").notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("push_subscriptions_endpoint_idx").on(table.endpoint)],
);
