import { Card } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon, TrendingUpIcon, BarChart3Icon } from 'lucide-react';
import { Portfolio } from '@/types/trading';

interface PortfolioStatsProps {
  portfolio: Portfolio;
}

export const PortfolioStats = ({ portfolio }: PortfolioStatsProps) => {
  const totalValue = portfolio.balance + portfolio.currentValue;
  const isProfitable = portfolio.profitLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Value</p>
            <p className="text-2xl font-bold text-foreground">
              ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Cash Balance</p>
            <p className="text-2xl font-bold text-foreground">
              ₹{portfolio.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
            <WalletIcon className="h-6 w-6 text-accent" />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Value</p>
            <p className="text-2xl font-bold text-foreground">
              ₹{portfolio.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <TrendingUpIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total P&L</p>
            <p className={`text-2xl font-bold ${isProfitable ? 'text-success' : 'text-destructive'}`}>
              {isProfitable ? '+' : ''}₹{portfolio.profitLoss.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
            <p className={`text-sm ${isProfitable ? 'text-success' : 'text-destructive'} flex items-center gap-1`}>
              {isProfitable ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
              {Math.abs(portfolio.profitLossPercent).toFixed(2)}%
            </p>
          </div>
          <div className={`h-12 w-12 rounded-full ${isProfitable ? 'bg-success/10' : 'bg-destructive/10'} flex items-center justify-center`}>
            {isProfitable ? (
              <ArrowUpIcon className="h-6 w-6 text-success" />
            ) : (
              <ArrowDownIcon className="h-6 w-6 text-destructive" />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
