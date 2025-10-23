import { Button } from '@/components/ui/button';
import { TrendingUpIcon, RotateCcwIcon, LogOut, Trophy, BarChart3, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HeaderProps {
  onReset?: () => void;
  onRefresh?: () => void;
}

export const Header = ({ onReset, onRefresh }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUpIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SimStock</h1>
              <p className="text-sm text-muted-foreground">Virtual Trading Platform</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                {onRefresh && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/analytics')}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/leaderboard')}
                  className="gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Button>
                {onReset && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <RotateCcwIcon className="h-4 w-4" />
                        Reset
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">Reset Portfolio?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          This will clear all your holdings and transactions, and reset your balance to ₹1,00,000.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onReset} className="bg-destructive hover:bg-destructive/90">
                          Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
