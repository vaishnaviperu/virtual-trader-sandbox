import { Card } from '@/components/ui/card';
import { Transaction } from '@/types/trading';
import { HistoryIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionsHistoryProps {
  transactions: Transaction[];
}

export const TransactionsHistory = ({ transactions }: TransactionsHistoryProps) => {
  if (transactions.length === 0) {
    return (
      <Card className="p-12 border-border bg-card">
        <div className="text-center">
          <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Transactions Yet</h3>
          <p className="text-muted-foreground">Your trading history will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex items-center gap-2 mb-6">
        <HistoryIcon className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Transaction History</h2>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                transaction.type === 'BUY' ? 'bg-success/10' : 'bg-destructive/10'
              }`}>
                {transaction.type === 'BUY' ? (
                  <ArrowDownIcon className="h-5 w-5 text-success" />
                ) : (
                  <ArrowUpIcon className="h-5 w-5 text-destructive" />
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${
                    transaction.type === 'BUY' ? 'text-success' : 'text-destructive'
                  }`}>
                    {transaction.type}
                  </span>
                  <span className="font-semibold text-foreground">{transaction.symbol}</span>
                </div>
                <p className="text-sm text-muted-foreground">{transaction.name}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-foreground">
                {transaction.quantity} × ₹{transaction.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(transaction.timestamp, 'MMM dd, yyyy HH:mm')}
              </p>
              <p className={`text-sm font-medium ${
                transaction.type === 'BUY' ? 'text-destructive' : 'text-success'
              }`}>
                {transaction.type === 'BUY' ? '-' : '+'}₹{transaction.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
