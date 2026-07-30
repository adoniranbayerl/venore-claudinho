"use client";

import { useActionState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
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

  useActionToast({ pending: upPending, error: upState.error });
  useActionToast({ pending: downPending, error: downState.error });
  useActionToast({ pending: removePending, error: removeState.error, successMessage: "Item removido." });

  return (
    <li className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <div>
        <span className="font-medium text-foreground">{label}</span>{" "}
        <span className="text-muted-foreground/56">→ {href}</span>
      </div>
      <div className="flex items-center gap-1">
        <form action={upAction}>
          <input type="hidden" name="menuItemId" value={menuItemId} />
          <Button type="submit" variant="outline" size="icon-sm" disabled={isFirst || upPending} aria-label="Mover para cima">
            <ArrowUp />
          </Button>
        </form>
        <form action={downAction}>
          <input type="hidden" name="menuItemId" value={menuItemId} />
          <Button type="submit" variant="outline" size="icon-sm" disabled={isLast || downPending} aria-label="Mover para baixo">
            <ArrowDown />
          </Button>
        </form>
        <form action={removeAction}>
          <input type="hidden" name="menuItemId" value={menuItemId} />
          <Button
            type="submit"
            variant="destructive"
            size="icon-sm"
            disabled={removePending}
            aria-label="Remover item do menu"
          >
            <Trash2 />
          </Button>
        </form>
      </div>
    </li>
  );
}
