import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StockChartProps {
  symbol: string;
  yesterdayPrice: number;
  currentPrice: number;
  tomorrowPredicted: number;
}

export const StockChart = ({ symbol, yesterdayPrice, currentPrice, tomorrowPredicted }: StockChartProps) => {
  const data = [
    { day: 'Yesterday', price: yesterdayPrice },
    { day: 'Today', price: currentPrice },
    { day: 'Tomorrow', price: tomorrowPredicted }
  ];

  const isUpward = tomorrowPredicted > yesterdayPrice;

  return (
    <Card className="p-4 border-border bg-card/50">
      <h4 className="text-sm font-medium text-muted-foreground mb-2">Price Trend</h4>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            stroke="hsl(var(--border))"
          />
          <YAxis 
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            stroke="hsl(var(--border))"
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => `₹${value.toFixed(2)}`}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={isUpward ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
            strokeWidth={2}
            dot={{ fill: isUpward ? 'hsl(var(--success))' : 'hsl(var(--destructive))', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
