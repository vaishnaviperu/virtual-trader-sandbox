import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stock } from '@/types/trading';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from 'lucide-react';
import { TradeDialog } from './TradeDialog';

interface StockListProps {
  stocks: Stock[];
  onBuy: (symbol: string, quantity: number) => boolean;
  onSell: (symbol: string, quantity: number) => boolean;
  holdings: { [key: string]: number };
}

export const StockList = ({ stocks, onBuy, onSell, holdings }: StockListProps) => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  const handleTrade = (type: 'BUY' | 'SELL', stock: Stock) => {
    setTradeType(type);
    setSelectedStock(stock);
  };

  return (
    <>
      <Card className="p-6 border-border bg-card">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUpIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Market Watch</h2>
        </div>
        
        <div className="space-y-3">
          {stocks.map((stock) => {
            const isPositive = stock.change >= 0;
            const hasHolding = holdings[stock.symbol] > 0;
            
            return (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{stock.symbol}</h3>
                    {hasHolding && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Holding
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                      <span>{isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleTrade('BUY', stock)}
                      className="bg-success hover:bg-success/90 text-success-foreground"
                    >
                      Buy
                    </Button>
                    {hasHolding && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleTrade('SELL', stock)}
                      >
                        Sell
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {selectedStock && (
        <TradeDialog
          stock={selectedStock}
          type={tradeType}
          isOpen={!!selectedStock}
          onClose={() => setSelectedStock(null)}
          onConfirm={tradeType === 'BUY' ? onBuy : onSell}
          maxQuantity={tradeType === 'SELL' ? holdings[selectedStock.symbol] : undefined}
        />
      )}
    </>
  );
};
