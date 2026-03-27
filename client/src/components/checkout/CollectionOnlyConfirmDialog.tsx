import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

interface CollectionOnlyConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  onConfirm: () => void;
}

export function CollectionOnlyConfirmDialog({
  open,
  onOpenChange,
  productName,
  onConfirm,
}: CollectionOnlyConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden border-2 border-primary/40 p-0 rounded-3xl">
        <div className="bg-gradient-to-br from-secondary via-background to-primary/10 px-7 py-8 sm:px-9 sm:py-10">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-3xl sm:text-4xl text-accent">
              Collection Only
            </DialogTitle>
            <DialogDescription className="text-accent/80 pt-3 whitespace-pre-line text-base sm:text-lg leading-relaxed">
              <span className="font-semibold text-accent">{productName}</span> are freshly made and available for collection only.
              {"\n\n"}
              To keep them at their best quality, we do not offer delivery for these items.
              {"\n"}
              Please confirm you are happy to collect your order.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-8 flex-row justify-end gap-3">
            <Button size="lg" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="lg" onClick={onConfirm}>Confirm</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
