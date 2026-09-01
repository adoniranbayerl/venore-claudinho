"use client";

import { useCallback, useEffect, useState } from "react";
import type { BoardFeedView, BoardPublicView } from "@/plugins/helpdesk";
import { Kanban } from "./kanban";
import { OpenList } from "./open-list";

// Casca client do painel de TV (§2.6). Faz polling em GET /api/helpdesk/board/[token] a cada
// `refreshSeconds` e troca o conteúdo sem recarregar a página. Sem SSE no v1 (Fase 8). Tudo
// dimensionado para leitura a ~3 m: título grande, contadores grandes, cards com folga.
export function BoardScreen({ token, initial }: { token: string; initial: BoardPublicView }) {
  const [feed, setFeed] = useState<BoardFeedView | null>(null);
  const [stale, setStale] = useState(false);

  const refreshSeconds = feed?.refreshSeconds ?? initial.refreshSeconds;

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/helpdesk/board/${token}`, { cache: "no-store" });
      if (!response.ok) {
        setStale(true);
        return;
      }
      const data = (await response.json()) as BoardFeedView;
      setFeed(data);
      setStale(false);
    } catch {
      setStale(true);
    }
  }, [token]);

  useEffect(() => {
    // Deferido pra fora do corpo síncrono do efeito (mesmo padrão de notifications-client.tsx): o
    // primeiro feed só existe no client e setar no render inicial dispararia render em cascata.
    queueMicrotask(() => void load());
    const timer = setInterval(() => void load(), Math.max(5, refreshSeconds) * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load, refreshSeconds]);

  const label = feed?.label ?? initial.label;
  const layout = feed?.layout ?? initial.layout;
  const queueName = feed?.queueName ?? initial.queueName;
  const showAssignee = feed?.showAssignee ?? initial.showAssignee;
  const updatedAt = feed ? new Date(feed.generatedAt) : null;

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{label}</h1>
          <p className="mt-1 text-lg text-muted-foreground">
            {queueName ?? "Todas as filas"}
            {stale && <span className="ml-2 text-warning">· sem conexão, tentando de novo…</span>}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:gap-5">
          {feed && (
            <>
              <Counter label="Abertos" value={feed.counts.open} tone="strong" />
              <Counter label="Em andamento" value={feed.counts.inProgress} />
              <Counter label="Aguardando" value={feed.counts.waiting} tone="warning" />
              <Counter label="Resolvidos" value={feed.counts.resolved} tone="muted" />
            </>
          )}
          {updatedAt && (
            <span className="text-base text-muted-foreground tabular-nums">
              {updatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      </header>

      {!feed ? (
        <p className="flex flex-1 items-center justify-center text-xl text-muted-foreground">Carregando o painel…</p>
      ) : layout === "kanban" ? (
        <Kanban columns={feed.columns} showAssignee={showAssignee} showQueue={queueName === null} />
      ) : (
        <OpenList column={feed.columns[0]} showAssignee={showAssignee} showQueue={queueName === null} />
      )}
    </div>
  );
}

function Counter({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "strong" | "warning" | "muted";
}) {
  const valueClass =
    tone === "warning"
      ? "text-warning"
      : tone === "muted"
        ? "text-muted-foreground"
        : tone === "strong"
          ? "text-foreground"
          : "text-foreground";
  return (
    <span className="flex flex-col items-center leading-none">
      <span className={`text-3xl font-bold tabular-nums sm:text-4xl ${valueClass}`}>{value}</span>
      <span className="mt-1 text-xs uppercase tracking-wide text-muted-foreground sm:text-sm">{label}</span>
    </span>
  );
}
