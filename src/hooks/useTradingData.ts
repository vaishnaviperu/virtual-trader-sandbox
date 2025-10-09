import { useState, useEffect, useCallback } from 'react';
import { Stock, Portfolio, Transaction, Holding } from '@/types/trading';
import { INITIAL_STOCKS, INITIAL_BALANCE, simulatePriceChange } from '@/lib/stocks';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'trading_simulator_data';

export const useTradingData = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    balance: INITIAL_BALANCE,
    totalInvested: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
    holdings: [],
    transactions: [],
  });

  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setPortfolio({
        ...parsed,
        transactions: parsed.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        })),
      });
    }

    // Initialize stocks with previous prices
    const initialStocks: Stock[] = INITIAL_STOCKS.map(stock => ({
      ...stock,
      previousPrice: stock.currentPrice,
      change: 0,
      changePercent: 0,
    }));
    setStocks(initialStocks);
  }, []);

  // Save to localStorage whenever portfolio changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  }, [portfolio]);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks =>
        prevStocks.map(stock => {
          const newPrice = simulatePriceChange(stock.currentPrice);
          const change = newPrice - stock.previousPrice;
          const changePercent = (change / stock.previousPrice) * 100;
          
          return {
            ...stock,
            currentPrice: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
          };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Recalculate portfolio value when stock prices change
  useEffect(() => {
    if (portfolio.holdings.length === 0) return;

    const updatedHoldings: Holding[] = portfolio.holdings.map(holding => {
      const stock = stocks.find(s => s.symbol === holding.symbol);
      if (!stock) return holding;

      const currentValue = holding.quantity * stock.currentPrice;
      const profitLoss = currentValue - holding.invested;
      const profitLossPercent = (profitLoss / holding.invested) * 100;

      return {
        ...holding,
        currentPrice: stock.currentPrice,
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
      };
    });

    const currentValue = updatedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalInvested = updatedHoldings.reduce((sum, h) => sum + h.invested, 0);
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    setPortfolio(prev => ({
      ...prev,
      holdings: updatedHoldings,
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      currentValue: parseFloat(currentValue.toFixed(2)),
      profitLoss: parseFloat(profitLoss.toFixed(2)),
      profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
    }));
  }, [stocks]);

  const buyStock = useCallback(
    (symbol: string, quantity: number) => {
      const stock = stocks.find(s => s.symbol === symbol);
      if (!stock) return false;

      const total = stock.currentPrice * quantity;
      if (total > portfolio.balance) {
        toast({
          title: 'Insufficient Balance',
          description: `You need ₹${total.toFixed(2)} but have ₹${portfolio.balance.toFixed(2)}`,
          variant: 'destructive',
        });
        return false;
      }

      const transaction: Transaction = {
        id: Date.now().toString(),
        type: 'BUY',
        symbol: stock.symbol,
        name: stock.name,
        quantity,
        price: stock.currentPrice,
        total: parseFloat(total.toFixed(2)),
        timestamp: new Date(),
      };

      setPortfolio(prev => {
        const existingHolding = prev.holdings.find(h => h.symbol === symbol);
        let newHoldings: Holding[];

        if (existingHolding) {
          const newQuantity = existingHolding.quantity + quantity;
          const newInvested = existingHolding.invested + total;
          const newAvgPrice = newInvested / newQuantity;
          const newCurrentValue = newQuantity * stock.currentPrice;
          const newProfitLoss = newCurrentValue - newInvested;
          const newProfitLossPercent = (newProfitLoss / newInvested) * 100;

          newHoldings = prev.holdings.map(h =>
            h.symbol === symbol
              ? {
                  ...h,
                  quantity: newQuantity,
                  avgPrice: parseFloat(newAvgPrice.toFixed(2)),
                  invested: parseFloat(newInvested.toFixed(2)),
                  currentValue: parseFloat(newCurrentValue.toFixed(2)),
                  profitLoss: parseFloat(newProfitLoss.toFixed(2)),
                  profitLossPercent: parseFloat(newProfitLossPercent.toFixed(2)),
                }
              : h
          );
        } else {
          const newHolding: Holding = {
            symbol: stock.symbol,
            name: stock.name,
            quantity,
            avgPrice: stock.currentPrice,
            currentPrice: stock.currentPrice,
            invested: parseFloat(total.toFixed(2)),
            currentValue: parseFloat(total.toFixed(2)),
            profitLoss: 0,
            profitLossPercent: 0,
          };
          newHoldings = [...prev.holdings, newHolding];
        }

        return {
          ...prev,
          balance: parseFloat((prev.balance - total).toFixed(2)),
          holdings: newHoldings,
          transactions: [transaction, ...prev.transactions],
        };
      });

      toast({
        title: 'Stock Purchased',
        description: `Bought ${quantity} shares of ${stock.name} at ₹${stock.currentPrice.toFixed(2)}`,
      });

      return true;
    },
    [stocks, portfolio.balance]
  );

  const sellStock = useCallback(
    (symbol: string, quantity: number) => {
      const stock = stocks.find(s => s.symbol === symbol);
      const holding = portfolio.holdings.find(h => h.symbol === symbol);

      if (!stock || !holding) return false;

      if (quantity > holding.quantity) {
        toast({
          title: 'Insufficient Shares',
          description: `You only have ${holding.quantity} shares of ${stock.name}`,
          variant: 'destructive',
        });
        return false;
      }

      const total = stock.currentPrice * quantity;
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: 'SELL',
        symbol: stock.symbol,
        name: stock.name,
        quantity,
        price: stock.currentPrice,
        total: parseFloat(total.toFixed(2)),
        timestamp: new Date(),
      };

      setPortfolio(prev => {
        const newQuantity = holding.quantity - quantity;
        let newHoldings: Holding[];

        if (newQuantity === 0) {
          newHoldings = prev.holdings.filter(h => h.symbol !== symbol);
        } else {
          const proportionSold = quantity / holding.quantity;
          const investedSold = holding.invested * proportionSold;
          const newInvested = holding.invested - investedSold;
          const newCurrentValue = newQuantity * stock.currentPrice;
          const newProfitLoss = newCurrentValue - newInvested;
          const newProfitLossPercent = (newProfitLoss / newInvested) * 100;

          newHoldings = prev.holdings.map(h =>
            h.symbol === symbol
              ? {
                  ...h,
                  quantity: newQuantity,
                  invested: parseFloat(newInvested.toFixed(2)),
                  currentValue: parseFloat(newCurrentValue.toFixed(2)),
                  profitLoss: parseFloat(newProfitLoss.toFixed(2)),
                  profitLossPercent: parseFloat(newProfitLossPercent.toFixed(2)),
                }
              : h
          );
        }

        return {
          ...prev,
          balance: parseFloat((prev.balance + total).toFixed(2)),
          holdings: newHoldings,
          transactions: [transaction, ...prev.transactions],
        };
      });

      toast({
        title: 'Stock Sold',
        description: `Sold ${quantity} shares of ${stock.name} at ₹${stock.currentPrice.toFixed(2)}`,
      });

      return true;
    },
    [stocks, portfolio.holdings]
  );

  const resetPortfolio = useCallback(() => {
    setPortfolio({
      balance: INITIAL_BALANCE,
      totalInvested: 0,
      currentValue: 0,
      profitLoss: 0,
      profitLossPercent: 0,
      holdings: [],
      transactions: [],
    });
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: 'Portfolio Reset',
      description: 'Your portfolio has been reset to initial state',
    });
  }, []);

  return {
    stocks,
    portfolio,
    buyStock,
    sellStock,
    resetPortfolio,
  };
};
