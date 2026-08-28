"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Abas dirigidas por URL (?tab=) — o servidor renderiza só a view ativa, sem arrastar dado das
// outras. Mantém sector/date na query ao trocar de aba.
export function AdminTabs({
  tabs,
  active,
}: {
  tabs: { key: string; label: string }[];
  active: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function select(key: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", key);
    router.push(`?${next.toString()}`);
  }

  return (
    <Tabs value={active} onValueChange={select}>
      <div className="overflow-x-auto">
        <TabsList className="w-fit">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="shrink-0">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
