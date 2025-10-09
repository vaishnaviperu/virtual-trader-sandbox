import { Button } from '@/components/ui/button';
import { TrendingUpIcon, RotateCcwIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HeaderProps {
  onReset: () => void;
}

export const Header = ({ onReset }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUpIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">TradeSimulator</h1>
              <p className="text-sm text-muted-foreground">Practice Trading Risk-Free</p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-border text-foreground hover:bg-muted">
                <RotateCcwIcon className="h-4 w-4" />
                Reset Portfolio
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Reset Portfolio?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will clear all your holdings and transactions, and reset your balance to ₹1,00,000. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border text-foreground hover:bg-muted">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onReset} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
};
