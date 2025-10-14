import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stock } from '@/types/trading';

interface TradeDialogProps {
  stock: Stock;
  type: 'BUY' | 'SELL';
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (symbol: string, quantity: number) => Promise<boolean>;
  maxQuantity?: number;
}

export const TradeDialog = ({ stock, type, isOpen, onClose, onConfirm, maxQuantity }: TradeDialogProps) => {
  const [quantity, setQuantity] = useState(1);

  const total = stock.currentPrice * quantity;

  const handleConfirm = async () => {
    const success = await onConfirm(stock.symbol, quantity);
    if (success) {
      setQuantity(1);
      onClose();
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (maxQuantity) {
      setQuantity(Math.min(Math.max(0, num), maxQuantity));
    } else {
      setQuantity(Math.max(0, num));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {type === 'BUY' ? 'Buy' : 'Sell'} {stock.symbol}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {stock.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Current Price</span>
            <span className="font-semibold text-foreground">
              ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-foreground">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="bg-background border-input text-foreground"
            />
            {maxQuantity && (
              <p className="text-xs text-muted-foreground">
                Available: {maxQuantity} shares
              </p>
            )}
          </div>

          <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium text-foreground">Total Amount</span>
            <span className="text-xl font-bold text-primary">
              ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className={`flex-1 ${type === 'BUY' ? 'bg-success hover:bg-success/90 text-success-foreground' : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'}`}
              disabled={quantity < 1 || (maxQuantity !== undefined && quantity > maxQuantity)}
            >
              Confirm {type === 'BUY' ? 'Purchase' : 'Sale'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
