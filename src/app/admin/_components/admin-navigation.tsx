import Link from "next/link";
import type { AdminNavGroup } from "@/platform/admin-shell/types";

export function AdminNavigation({ groups }: { groups: AdminNavGroup[] }) {
  return (
    <nav className="w-64 shrink-0 border-r border-gray-200 p-4">
      <ul className="space-y-6">
        {groups.map((group) => (
          <li key={group.key}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{group.label}</p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="block rounded px-2 py-1 text-sm text-gray-800 hover:bg-gray-100">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
