"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export type BirthdaysByMonthDatum = {
  month: string;
  total: number;
};

const chartConfig: ChartConfig = {
  total: { label: "Aniversariantes", color: "var(--chart-1)" },
};

export function BirthdaysByMonthChart({ data }: { data: BirthdaysByMonthDatum[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <BarChart data={data} barGap={4}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={28} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="total" name="Aniversariantes" fill="var(--color-total)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
