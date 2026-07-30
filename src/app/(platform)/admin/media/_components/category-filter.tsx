"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function CategoryFilter({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategoryId = searchParams.get("category") ?? "";

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    router.push(query ? `/admin/media?${query}` : "/admin/media");
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      Categoria
      <select
        value={currentCategoryId}
        onChange={handleChange}
        className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground outline-none ui-motion-base focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Todas</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}
