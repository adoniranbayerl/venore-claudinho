"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export type EnrollmentCompositionDatum = {
  key: string;
  label: string;
  renewed: number;
  newEnrollments: number;
};

const chartConfig: ChartConfig = {
  renewed: { label: "Rematriculados", color: "var(--chart-2)" },
  newEnrollments: { label: "Novas matrículas", color: "var(--chart-1)" },
};

export function EnrollmentCompositionChart({ data }: { data: EnrollmentCompositionDatum[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {/* stroke na cor do card cria o respiro de 2px entre os segmentos empilhados (dataviz
            skill — marks-and-anatomy). Só o segmento do topo (newEnrollments) arredonda, porque é
            o "data-end" que não está ancorado na baseline. */}
        <Bar dataKey="renewed" name="Rematriculados" stackId="total" fill="var(--color-renewed)" stroke="var(--card)" strokeWidth={2} />
        <Bar
          dataKey="newEnrollments"
          name="Novas matrículas"
          stackId="total"
          fill="var(--color-newEnrollments)"
          stroke="var(--card)"
          strokeWidth={2}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
