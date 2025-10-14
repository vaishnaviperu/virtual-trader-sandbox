import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Header } from '@/components/Header';

interface LeaderboardEntry {
  id: string;
  username: string;
  profit_loss: number;
  profit_loss_percent: number;
  current_value: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          id,
          profit_loss,
          profit_loss_percent,
          current_value,
          user_id,
          profiles!inner(username)
        `)
        .order('profit_loss', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formatted = data.map((entry: any) => ({
        id: entry.id,
        username: entry.profiles.username,
        profit_loss: parseFloat(entry.profit_loss),
        profit_loss_percent: parseFloat(entry.profit_loss_percent),
        current_value: parseFloat(entry.current_value),
      }));

      setLeaderboard(formatted);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Trophy className="h-5 w-5 text-amber-700" />;
    return <span className="text-muted-foreground">#{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={() => {}} />
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Trader</TableHead>
                    <TableHead className="text-right">Portfolio Value</TableHead>
                    <TableHead className="text-right">Profit/Loss</TableHead>
                    <TableHead className="text-right">Return %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {getRankIcon(index)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {entry.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{entry.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{entry.current_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${entry.profit_loss >= 0 ? 'text-success' : 'text-destructive'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {entry.profit_loss >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          ₹{Math.abs(entry.profit_loss).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${entry.profit_loss_percent >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {entry.profit_loss_percent >= 0 ? '+' : ''}{entry.profit_loss_percent.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
