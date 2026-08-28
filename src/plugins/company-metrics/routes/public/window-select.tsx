"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OPTIONS = [
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Últimos 12 meses" },
];

export function WindowSelect({ value }: { value: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function select(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("window", next);
    router.push(`?${params.toString()}`);
  }

  return (
    <Select value={String(value)} onValueChange={select}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
