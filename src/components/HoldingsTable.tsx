import { Card } from '@/components/ui/card';
import { Holding } from '@/types/trading';
import { PackageIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface HoldingsTableProps {
  holdings: Holding[];
}

export const HoldingsTable = ({ holdings }: HoldingsTableProps) => {
  if (holdings.length === 0) {
    return (
      <Card className="p-12 border-border bg-card">
        <div className="text-center">
          <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Holdings Yet</h3>
          <p className="text-muted-foreground">Start trading to build your portfolio</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex items-center gap-2 mb-6">
        <PackageIcon className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">My Holdings</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Qty</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Avg Price</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Current</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Invested</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Current Value</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">P&L</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => {
              const isProfitable = holding.profitLoss >= 0;
              
              return (
                <tr key={holding.symbol} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-foreground">{holding.symbol}</p>
                      <p className="text-sm text-muted-foreground">{holding.name}</p>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 text-foreground">{holding.quantity}</td>
                  <td className="text-right py-4 px-4 text-foreground">
                    ₹{holding.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-right py-4 px-4 text-foreground">
                    ₹{holding.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-right py-4 px-4 text-foreground">
                    ₹{holding.invested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-right py-4 px-4 text-foreground">
                    ₹{holding.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-right py-4 px-4">
                    <div className={isProfitable ? 'text-success' : 'text-destructive'}>
                      <div className="flex items-center justify-end gap-1 font-semibold">
                        {isProfitable ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                        {isProfitable ? '+' : ''}₹{holding.profitLoss.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm">
                        ({isProfitable ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
