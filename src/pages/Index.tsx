import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { PortfolioStats } from '@/components/PortfolioStats';
import { StockList } from '@/components/StockList';
import { HoldingsTable } from '@/components/HoldingsTable';
import { TransactionsHistory } from '@/components/TransactionsHistory';
import { useDbTradingData } from '@/hooks/useDbTradingData';
import { useAuth } from '@/contexts/AuthContext';
import { PackageIcon, TrendingUpIcon, HistoryIcon } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stocks, portfolio, buyStock, sellStock, resetPortfolio, refreshPrices, loading } = useDbTradingData();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const holdingsMap = portfolio.holdings.reduce((acc, holding) => {
    acc[holding.symbol] = holding.quantity;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={resetPortfolio} onRefresh={refreshPrices} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <PortfolioStats portfolio={portfolio} />
        </div>

        <Tabs defaultValue="market" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="market" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUpIcon className="h-4 w-4" />
              Market
            </TabsTrigger>
            <TabsTrigger value="holdings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <PackageIcon className="h-4 w-4" />
              Holdings
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <HistoryIcon className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="space-y-6">
            <StockList
              stocks={stocks}
              onBuy={buyStock}
              onSell={sellStock}
              holdings={holdingsMap}
            />
          </TabsContent>

          <TabsContent value="holdings">
            <HoldingsTable holdings={portfolio.holdings} />
          </TabsContent>

          <TabsContent value="history">
            <TransactionsHistory transactions={portfolio.transactions} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
