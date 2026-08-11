"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export type GoalVsActualDatum = {
  key: string;
  label: string;
  goal: number;
  total: number;
};

// Meta como referência neutra (chart-3, recua) e total realizado como a série "quente" (chart-1,
// primary) — mesma lógica de cor por função (não por posição) do dataviz skill: a barra que
// carrega a resposta ("quanto matriculamos") tem mais peso visual que a barra de referência.
const chartConfig: ChartConfig = {
  goal: { label: "Meta", color: "var(--chart-3)" },
  total: { label: "Total", color: "var(--chart-1)" },
};

export function GoalVsActualChart({ data }: { data: GoalVsActualDatum[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={data} barGap={4}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="goal" name="Meta" fill="var(--color-goal)" radius={4} />
        <Bar dataKey="total" name="Total" fill="var(--color-total)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
