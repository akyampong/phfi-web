"use client";

import { Trash2 } from "lucide-react";
import { deleteMessage } from "./actions";

/** Delete, after checking: it can't be undone. */
export function DeleteButton({ id, className }: { id: string; className: string }) {
  return (
    <form
      action={deleteMessage}
      onSubmit={(event) => {
        if (!window.confirm("Delete this for good? It can’t be undone.")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>
        <Trash2 aria-hidden className="size-4" />
        Delete
      </button>
    </form>
  );
}
