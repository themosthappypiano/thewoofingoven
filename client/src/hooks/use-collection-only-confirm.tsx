import { useRef, useState } from "react";
import { CollectionOnlyConfirmDialog } from "@/components/checkout/CollectionOnlyConfirmDialog";

export function useCollectionOnlyConfirm() {
  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const pendingActionRef = useRef<(() => void) | null>(null);

  const requestCollectionOnlyConfirm = (name: string, onConfirm: () => void) => {
    setProductName(name);
    pendingActionRef.current = onConfirm;
    setOpen(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      pendingActionRef.current = null;
    }
  };

  const handleConfirm = () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setOpen(false);
    if (action) action();
  };

  const dialog = (
    <CollectionOnlyConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      productName={productName}
      onConfirm={handleConfirm}
    />
  );

  return { requestCollectionOnlyConfirm, dialog };
}
