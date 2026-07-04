import { useRef, useState } from "react";
import { CollectionOnlyConfirmDialog } from "@/components/checkout/CollectionOnlyConfirmDialog";
import type { ReactNode } from "react";

type ConfirmOptions = {
  title?: string;
  description?: ReactNode;
};

export function getBarkdayBoxFreshConfirmOptions(productName: string): ConfirmOptions {
  return {
    title: "Freshly made to order",
    description: (
      <>
        <span className="font-semibold text-accent">{productName}</span> boxes are freshly made to order.
        {"\n\n"}
        Please allow at least <strong>5 days of preparation</strong> before collection or delivery so we can keep your pup&apos;s box fresh and beautifully prepared.
        {"\n"}
        Please confirm you are happy to continue.
      </>
    ),
  };
}

export function useCollectionOnlyConfirm() {
  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [options, setOptions] = useState<ConfirmOptions>({});
  const pendingActionRef = useRef<(() => void) | null>(null);

  const requestCollectionOnlyConfirm = (name: string, onConfirm: () => void, confirmOptions: ConfirmOptions = {}) => {
    setProductName(name);
    setOptions(confirmOptions);
    pendingActionRef.current = onConfirm;
    setOpen(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      pendingActionRef.current = null;
      setOptions({});
    }
  };

  const handleConfirm = () => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setOptions({});
    setOpen(false);
    if (action) action();
  };

  const dialog = (
    <CollectionOnlyConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      productName={productName}
      onConfirm={handleConfirm}
      title={options.title}
      description={options.description}
    />
  );

  return { requestCollectionOnlyConfirm, dialog };
}
