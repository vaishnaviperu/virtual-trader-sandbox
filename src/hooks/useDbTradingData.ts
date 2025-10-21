import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Stock, Portfolio, Holding, Transaction } from '@/types/trading';
import { INITIAL_STOCKS } from '@/lib/stocks';
import { toast } from 'sonner';

export function useDbTradingData() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    balance: 100000,
    totalInvested: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
    holdings: [],
    transactions: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch stock prices
  useEffect(() => {
    const initStocks = INITIAL_STOCKS.map(stock => ({
      ...stock,
      previousPrice: 0,
      change: 0,
      changePercent: 0,
    }));
    setStocks(initStocks);

    fetchStockPrices();
    const interval = setInterval(fetchStockPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch portfolio data when user changes
  useEffect(() => {
    if (user) {
      fetchPortfolioData();
    }
  }, [user]);

  const fetchStockPrices = async () => {
    try {
      const symbols = INITIAL_STOCKS.map(s => s.symbol);
      const { data, error } = await supabase.functions.invoke('fetch-stock-prices', {
        body: { symbols },
      });

      if (error) throw error;

      if (data?.prices) {
        const updatedStocks = INITIAL_STOCKS.map((stock) => {
          const priceData = data.prices.find((p: any) => p.symbol === stock.symbol);
          if (priceData && !priceData.error) {
            return {
              ...stock,
              currentPrice: priceData.currentPrice,
              previousPrice: priceData.previousClose,
              change: priceData.change,
              changePercent: priceData.changePercent,
              yesterdayPrice: priceData.yesterdayPrice,
              tomorrowPredicted: priceData.tomorrowPredicted,
              volume: 1000000,
            };
          }
          return {
            ...stock,
            currentPrice: 0,
            previousPrice: 0,
            change: 0,
            changePercent: 0,
            yesterdayPrice: 0,
            tomorrowPredicted: 0,
          };
        });
        setStocks(updatedStocks);
      }
    } catch (error: any) {
      console.error('Error fetching stock prices:', error);
      toast.error('Failed to fetch stock prices');
    }
  };

  const fetchPortfolioData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch portfolio
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (portfolioError) throw portfolioError;

      // Fetch holdings
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id);

      if (holdingsError) throw holdingsError;

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Convert holdings to Portfolio format
      const holdings: Holding[] = (holdingsData || []).map(h => {
        const stock = stocks.find(s => s.symbol === h.symbol);
        const currentPrice = stock?.currentPrice || Number(h.avg_price);
        const avgPrice = Number(h.avg_price);
        const invested = h.quantity * avgPrice;
        const currentValue = h.quantity * currentPrice;
        const profitLoss = currentValue - invested;

        return {
          symbol: h.symbol,
          name: h.name,
          quantity: h.quantity,
          avgPrice,
          currentPrice,
          invested,
          currentValue,
          profitLoss,
          profitLossPercent: invested > 0 ? (profitLoss / invested) * 100 : 0,
        };
      });

      // Convert transactions
      const transactions: Transaction[] = (transactionsData || []).map(t => ({
        id: t.id,
        type: t.type as 'BUY' | 'SELL',
        symbol: t.symbol,
        name: t.name,
        quantity: t.quantity,
        price: Number(t.price),
        total: Number(t.total),
        timestamp: new Date(t.created_at),
      }));

      setPortfolio({
        balance: Number(portfolioData.balance),
        totalInvested: Number(portfolioData.total_invested),
        currentValue: Number(portfolioData.current_value),
        profitLoss: Number(portfolioData.profit_loss),
        profitLossPercent: Number(portfolioData.profit_loss_percent),
        holdings,
        transactions,
      });
    } catch (error: any) {
      console.error('Error fetching portfolio:', error);
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const buyStock = async (symbol: string, quantity: number): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to trade');
      return false;
    }

    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock || stock.currentPrice === 0) {
      toast.error('Stock price not available');
      return false;
    }

    const total = stock.currentPrice * quantity;
    if (total > portfolio.balance) {
      toast.error('Insufficient balance');
      return false;
    }

    try {
      // Update or insert holding
      const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
      
      if (existingHolding) {
        const newQuantity = existingHolding.quantity + quantity;
        const newAvgPrice = (existingHolding.avgPrice * existingHolding.quantity + total) / newQuantity;

        await supabase
          .from('holdings')
          .update({ 
            quantity: newQuantity, 
            avg_price: newAvgPrice 
          })
          .eq('user_id', user.id)
          .eq('symbol', symbol);
      } else {
        await supabase
          .from('holdings')
          .insert({
            user_id: user.id,
            symbol,
            name: stock.name,
            quantity,
            avg_price: stock.currentPrice,
          });
      }

      // Insert transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'BUY',
          symbol,
          name: stock.name,
          quantity,
          price: stock.currentPrice,
          total,
        });

      // Update portfolio
      await supabase
        .from('portfolios')
        .update({
          balance: portfolio.balance - total,
          total_invested: portfolio.totalInvested + total,
        })
        .eq('user_id', user.id);

      toast.success(`Bought ${quantity} shares of ${symbol}`);
      await fetchPortfolioData();
      return true;
    } catch (error: any) {
      console.error('Error buying stock:', error);
      toast.error('Failed to buy stock');
      return false;
    }
  };

  const sellStock = async (symbol: string, quantity: number): Promise<boolean> => {
    if (!user) {
      toast.error('Please sign in to trade');
      return false;
    }

    const stock = stocks.find(s => s.symbol === symbol);
    const holding = portfolio.holdings.find(h => h.symbol === symbol);

    if (!stock || !holding) {
      toast.error('You do not own this stock');
      return false;
    }

    if (quantity > holding.quantity) {
      toast.error('Insufficient shares');
      return false;
    }

    const total = stock.currentPrice * quantity;

    try {
      // Update or delete holding
      if (quantity === holding.quantity) {
        await supabase
          .from('holdings')
          .delete()
          .eq('user_id', user.id)
          .eq('symbol', symbol);
      } else {
        await supabase
          .from('holdings')
          .update({ quantity: holding.quantity - quantity })
          .eq('user_id', user.id)
          .eq('symbol', symbol);
      }

      // Insert transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'SELL',
          symbol,
          name: stock.name,
          quantity,
          price: stock.currentPrice,
          total,
        });

      // Update portfolio
      const amountInvested = holding.avgPrice * quantity;
      await supabase
        .from('portfolios')
        .update({
          balance: portfolio.balance + total,
          total_invested: Math.max(0, portfolio.totalInvested - amountInvested),
        })
        .eq('user_id', user.id);

      toast.success(`Sold ${quantity} shares of ${symbol}`);
      await fetchPortfolioData();
      return true;
    } catch (error: any) {
      console.error('Error selling stock:', error);
      toast.error('Failed to sell stock');
      return false;
    }
  };

  const resetPortfolio = async () => {
    if (!user) return;

    try {
      // Delete all holdings
      await supabase
        .from('holdings')
        .delete()
        .eq('user_id', user.id);

      // Delete all transactions
      await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      // Reset portfolio
      await supabase
        .from('portfolios')
        .update({
          balance: 100000,
          total_invested: 0,
          current_value: 0,
          profit_loss: 0,
          profit_loss_percent: 0,
        })
        .eq('user_id', user.id);

      toast.success('Portfolio reset successfully');
      await fetchPortfolioData();
    } catch (error: any) {
      console.error('Error resetting portfolio:', error);
      toast.error('Failed to reset portfolio');
    }
  };

  return {
    stocks,
    portfolio,
    buyStock,
    sellStock,
    resetPortfolio,
    loading,
  };
}
