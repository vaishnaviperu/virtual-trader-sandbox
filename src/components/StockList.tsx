import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stock } from '@/types/trading';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, Info } from 'lucide-react';
import { TradeDialog } from './TradeDialog';
import { StockChart } from './StockChart';
import { CompanyInfoDialog } from './CompanyInfoDialog';

interface StockListProps {
  stocks: Stock[];
  onBuy: (symbol: string, quantity: number) => Promise<boolean>;
  onSell: (symbol: string, quantity: number) => Promise<boolean>;
  holdings: { [key: string]: number };
}

export const StockList = ({ stocks, onBuy, onSell, holdings }: StockListProps) => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [infoStock, setInfoStock] = useState<Stock | null>(null);

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
            const tomorrowChange = stock.tomorrowPredicted && stock.currentPrice 
              ? ((stock.tomorrowPredicted - stock.currentPrice) / stock.currentPrice) * 100 
              : 0;
            const tomorrowPositive = tomorrowChange >= 0;
            
            return (
              <div
                key={stock.symbol}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{stock.symbol}</h3>
                      {hasHolding && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Holding
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setInfoStock(stock)}
                        className="h-6 w-6 p-0"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
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

                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div className="text-center p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Yesterday</p>
                    <p className="font-medium text-foreground">
                      ₹{(stock.yesterdayPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="text-center p-2 rounded bg-primary/10">
                    <p className="text-xs text-muted-foreground mb-1">Today</p>
                    <p className="font-semibold text-foreground">
                      ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className={`flex items-center justify-center gap-1 text-xs ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                      <span>{isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>
                  
                  <div className="text-center p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Predicted Tomorrow</p>
                    <p className="font-medium text-foreground">
                      ₹{(stock.tomorrowPredicted || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className={`flex items-center justify-center gap-1 text-xs ${tomorrowPositive ? 'text-success' : 'text-destructive'}`}>
                      {tomorrowPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                      <span>{tomorrowPositive ? '+' : ''}{tomorrowChange.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <StockChart
                  symbol={stock.symbol}
                  yesterdayPrice={stock.yesterdayPrice || 0}
                  currentPrice={stock.currentPrice}
                  tomorrowPredicted={stock.tomorrowPredicted || 0}
                />
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

      <CompanyInfoDialog
        stock={infoStock}
        isOpen={!!infoStock}
        onClose={() => setInfoStock(null)}
      />
    </>
  );
};
