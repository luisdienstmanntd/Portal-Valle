"use client";

import { useId, useRef, type ReactNode } from "react";
import { Button } from "./primitives";
import { keepDialogFocus } from "./dialog-focus";

type DialogProps = { triggerLabel: string; title: string; description: string; children?: ReactNode };

function Modal({ triggerLabel, title, description, children, confirm }: DialogProps & { confirm?: { label: string; onConfirm: () => void } }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  return <>
    <Button variant="secondary" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">{triggerLabel}</Button>
    <dialog ref={dialog} className="dialog" role={confirm ? "alertdialog" : "dialog"} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onKeyDown={keepDialogFocus}>
      <h2 id={`${id}-title`}>{title}</h2>
      <p id={`${id}-description`}>{description}</p>
      {children}
      <div className="dialog-actions">
        <Button variant="secondary" autoFocus onClick={() => dialog.current?.close()}>{confirm ? "Cancelar" : "Fechar"}</Button>
        {confirm && <Button variant="danger" onClick={() => { confirm.onConfirm(); dialog.current?.close(); }}>{confirm.label}</Button>}
      </div>
    </dialog>
  </>;
}

export function Dialog(props: DialogProps) { return <Modal {...props} />; }

export function AlertDialog(props: DialogProps & { confirmLabel: string; onConfirm: () => void }) {
  const { confirmLabel, onConfirm, ...dialog } = props;
  return <Modal {...dialog} confirm={{ label: confirmLabel, onConfirm }} />;
}
