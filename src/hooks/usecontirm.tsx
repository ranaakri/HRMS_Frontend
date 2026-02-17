import { AlertDialogBasic } from "@/components/custom/AlertDialog";
import { useState } from "react";

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );

  const confirm = (msg: string) => {
    setMessage(msg);
    setOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleClose = (result: boolean) => {
    setOpen(false);
    resolver?.(result);
  };

  const ConfirmComponent = (
    <AlertDialogBasic open={open} message={message} onClose={handleClose} />
  );

  return { confirm, ConfirmComponent };
}
