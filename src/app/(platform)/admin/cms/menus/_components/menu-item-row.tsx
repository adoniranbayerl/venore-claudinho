"use client";

import { useActionState } from "react";
import {
  moveMenuItemDownAction,
  moveMenuItemUpAction,
  removeMenuItemAction,
  type MenuActionState,
} from "../actions";

const initialState: MenuActionState = { error: null };

export function MenuItemRow({
  menuItemId,
  label,
  href,
  isFirst,
  isLast,
}: {
  menuItemId: string;
  label: string;
  href: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [upState, upAction, upPending] = useActionState(moveMenuItemUpAction, initialState);
  const [downState, downAction, downPending] = useActionState(moveMenuItemDownAction, initialState);
  const [removeState, removeAction, removePending] = useActionState(removeMenuItemAction, initialState);

  const error = upState.error ?? downState.error ?? removeState.error;

  return (
    <li className="flex items-center justify-between gap-4 text-sm text-gray-700">
      <div>
        <span className="font-medium text-gray-900">{label}</span>{" "}
        <span className="text-gray-500">({href})</span>
      </div>
      <div className="flex items-center gap-1">
        <form action={upAction}>
          <input type="hidden" name="menuItemId" value={menuItemId} />
          <button
            type="submit"
            disabled={isFirst || upPending}
            className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-900 disabled:opacity-50"
          >
            Subir
          </button>
        </form>
        <form action={downAction}>
          <input type="hidden" name="menuItemId" value={menuItemId} />
          <button
            type="submit"
            disabled={isLast || downPending}
            className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-900 disabled:opacity-50"
          >
            Descer
          </button>
        </form>
        <form action={removeAction}>
          <input type="hidden" name="menuItemId" value={menuItemId} />
          <button
            type="submit"
            disabled={removePending}
            className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-red-600 disabled:opacity-50"
          >
            Remover
          </button>
        </form>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </li>
  );
}
