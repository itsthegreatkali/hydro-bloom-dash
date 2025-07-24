import { Leaf, Clock, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardHeaderProps {
  farmName?: string;
  lastUpdate: Date;
  isOnline: boolean;
}

const DashboardHeader = ({ 
  farmName = "Hydroponic Farm", 
  lastUpdate, 
  isOnline 
}: DashboardHeaderProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4 rounded-lg mb-6 shadow-[var(--shadow-medium)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-foreground/10 rounded-lg">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{farmName}</h1>
            <p className="text-primary-foreground/80 text-sm">
              NFT Monitoring Dashboard
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant={isOnline ? 'default' : 'destructive'}
              className={`
                ${isOnline ? 'bg-success text-white' : 'bg-destructive text-white'}
                font-medium
              `}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-primary-foreground/80">
            <Clock className="h-3 w-3" />
            <span>
              Last update: {formatTime(lastUpdate)}
            </span>
          </div>
          
          <div className="text-xs text-primary-foreground/60">
            {formatDate(lastUpdate)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;