"use client";

import { useState } from "react";
// Imports diretos dos módulos folha (não do barrel @/plugins/birthdays) — client component não
// pode arrastar @/infrastructure/database/client (pg) pelos handlers reexportados no barrel.
import { MONTH_LABELS } from "@/plugins/birthdays/shared/months";
import type { BirthdayAppearanceSettings } from "@/plugins/birthdays/shared/appearance";
import type { PublicBirthdayView } from "@/plugins/birthdays/features/list-public-birthdays/types";

const CARD_COLOR_FIELDS: (keyof BirthdayAppearanceSettings)[] = ["cardDarkColor", "cardTealColor", "cardAccentColor"];

export function BirthdaysPublicBoard({
  birthdays,
  appearance,
}: {
  birthdays: PublicBirthdayView[];
  appearance: BirthdayAppearanceSettings;
}) {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const monthBirthdays = birthdays.filter((birthday) => birthday.month === selectedMonth).sort((a, b) => a.day - b.day);

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: appearance.pageBackground }}>
      <style>{`
        @media print {
          .no-print { display: none; }
          body { margin: 0; padding: 10mm; }
        }
      `}</style>

      <div className="mx-auto mb-8 max-w-4xl">
        <h1 className="mb-2 text-center text-3xl font-bold sm:text-4xl" style={{ color: appearance.titleColor }}>
          Aniversariantes
        </h1>
        <p className="text-center text-lg" style={{ color: appearance.monthColor }}>
          {MONTH_LABELS[selectedMonth]}
        </p>
      </div>

      <div className="no-print mx-auto mb-8 flex max-w-4xl flex-wrap justify-center gap-2">
        {Object.entries(MONTH_LABELS).map(([month, label]) => {
          const isSelected = selectedMonth === Number(month);
          return (
            <button
              key={month}
              type="button"
              onClick={() => setSelectedMonth(Number(month))}
              className="rounded-md px-3 py-1.5 text-sm font-medium ui-motion-base"
              style={
                isSelected
                  ? { backgroundColor: appearance.cardTealColor, color: appearance.cardTextColor }
                  : { color: appearance.titleColor }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto max-w-4xl">
        {monthBirthdays.length === 0 ? (
          <p className="text-center" style={{ color: appearance.monthColor }}>
            Nenhum aniversariante neste mês
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {monthBirthdays.map((birthday, index) => {
              const cardColorField = CARD_COLOR_FIELDS[index % CARD_COLOR_FIELDS.length];
              return (
                <div
                  key={birthday.id}
                  className="rounded-lg p-4 shadow-md"
                  style={{ backgroundColor: appearance[cardColorField] }}
                >
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
                    style={{ backgroundColor: appearance.cardAccentColor, color: appearance.dayTextColor }}
                  >
                    {birthday.day}
                  </div>
                  <p className="mb-1 text-lg font-bold" style={{ color: appearance.cardTextColor }}>
                    {birthday.fullName}
                  </p>
                  {birthday.role && (
                    <p className="text-sm" style={{ color: appearance.roleTextColor }}>
                      {birthday.role}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="no-print mt-8 text-center text-sm" style={{ color: appearance.monthColor }}>
        Dica: Use Ctrl+P (ou Cmd+P) para imprimir
      </div>
    </div>
  );
}
