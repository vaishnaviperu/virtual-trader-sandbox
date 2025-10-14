import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import { Header } from '@/components/Header';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface AnalyticsData {
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  bestPerformer: { symbol: string; profitPercent: number } | null;
  worstPerformer: { symbol: string; lossPercent: number } | null;
  holdingsDistribution: { symbol: string; percentage: number; value: number }[];
}

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalInvested: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercent: 0,
    bestPerformer: null,
    worstPerformer: null,
    holdingsDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchAnalytics();
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Fetch portfolio
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch holdings
      const { data: holdings } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id);

      if (portfolio && holdings) {
        // Calculate total value using actual avg_price
        const totalValue = holdings.reduce((sum, h) => {
          const avgPrice = Number(h.avg_price);
          return sum + (h.quantity * avgPrice);
        }, 0);
        
        const holdingsWithPerformance = holdings.map(h => {
          const avgPrice = Number(h.avg_price);
          const invested = h.quantity * avgPrice;
          // For now, set profitPercent to 0 since we don't have current prices in this view
          const profitPercent = 0;
          return {
            ...h,
            profitPercent,
            percentage: totalValue > 0 ? (invested / totalValue) * 100 : 0,
            value: invested,
          };
        });

        const sorted = [...holdingsWithPerformance].sort((a, b) => b.profitPercent - a.profitPercent);

        setAnalytics({
          totalInvested: Number(portfolio.total_invested),
          currentValue: Number(portfolio.current_value),
          profitLoss: Number(portfolio.profit_loss),
          profitLossPercent: Number(portfolio.profit_loss_percent),
          bestPerformer: sorted.length > 0 ? { symbol: sorted[0].symbol, profitPercent: sorted[0].profitPercent } : null,
          worstPerformer: sorted.length > 0 ? { symbol: sorted[sorted.length - 1].symbol, lossPercent: sorted[sorted.length - 1].profitPercent } : null,
          holdingsDistribution: holdingsWithPerformance.map(h => ({
            symbol: h.symbol,
            percentage: h.percentage,
            value: h.value,
          })),
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onReset={() => {}} />
        <div className="container mx-auto p-6">
          <div className="text-center py-8">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={() => {}} />
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Portfolio Analytics</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{analytics.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{analytics.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
              {analytics.profitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${analytics.profitLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₹{Math.abs(analytics.profitLoss).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Return %</CardTitle>
              {analytics.profitLossPercent >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${analytics.profitLossPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                {analytics.profitLossPercent >= 0 ? '+' : ''}{analytics.profitLossPercent.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Best Performer</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.bestPerformer ? (
                <div>
                  <p className="text-2xl font-bold">{analytics.bestPerformer.symbol}</p>
                  <p className="text-success text-lg">
                    +{analytics.bestPerformer.profitPercent.toFixed(2)}%
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No holdings yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Worst Performer</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.worstPerformer ? (
                <div>
                  <p className="text-2xl font-bold">{analytics.worstPerformer.symbol}</p>
                  <p className="text-destructive text-lg">
                    {analytics.worstPerformer.lossPercent.toFixed(2)}%
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No holdings yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.holdingsDistribution.length > 0 ? (
              analytics.holdingsDistribution.map((holding) => (
                <div key={holding.symbol} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{holding.symbol}</span>
                    <span className="text-muted-foreground">
                      {holding.percentage.toFixed(1)}% • ₹{holding.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Progress value={holding.percentage} />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No holdings to display</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
