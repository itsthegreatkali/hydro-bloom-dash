import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import ECMonitorCard from '@/components/ECMonitorCard';
import WaterLevelCard from '@/components/WaterLevelCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sample data generator for demonstration
const generateECData = () => {
  const now = new Date();
  const data = [];
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const value = 1.2 + Math.random() * 0.8 + Math.sin(i * 0.3) * 0.3;
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(0.5, Math.min(2.5, value))
    });
  }
  
  return data;
};

const Dashboard = () => {
  const [ecData, setECData] = useState(generateECData());
  const [currentEC, setCurrentEC] = useState(1.6);
  const [waterLevel, setWaterLevel] = useState(78);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slight variations in EC
      const newEC = currentEC + (Math.random() - 0.5) * 0.1;
      setCurrentEC(Math.max(0.5, Math.min(2.5, newEC)));
      
      // Simulate gradual water level changes
      const newLevel = waterLevel + (Math.random() - 0.5) * 2;
      setWaterLevel(Math.max(0, Math.min(100, newLevel)));
      
      // Update data array
      const newDataPoint = {
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: newEC
      };
      
      setECData(prev => [...prev.slice(1), newDataPoint]);
      setLastUpdate(new Date());
      
      // Simulate occasional connection issues
      setIsOnline(Math.random() > 0.05);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [currentEC, waterLevel]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setECData(generateECData());
      setCurrentEC(1.2 + Math.random() * 0.8);
      setWaterLevel(50 + Math.random() * 40);
      setLastUpdate(new Date());
      setIsRefreshing(false);
      
      toast({
        title: "Data refreshed",
        description: "Latest sensor readings have been updated.",
      });
    }, 1000);
  };

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Exporting data as CSV file...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <DashboardHeader
          farmName="GreenGrow NFT Farm"
          lastUpdate={lastUpdate}
          isOnline={isOnline}
        />
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="bg-card/50 backdrop-blur-sm"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-card/50 backdrop-blur-sm"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-primary hover:bg-primary/90"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Main monitoring cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ECMonitorCard
            currentEC={currentEC}
            data={ecData}
            unit="mS/cm"
            optimalRange={{ min: 1.2, max: 2.0 }}
          />
          
          <WaterLevelCard
            level={waterLevel}
            height={Math.round(waterLevel * 3.2)} // Convert percentage to approximate mm
            lowThreshold={25}
          />
        </div>

        {/* Status bar */}
        <div className="bg-card/70 backdrop-blur-sm rounded-lg p-4 border border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>System Status: {isOnline ? 'Online' : 'Offline'}</span>
              <span>•</span>
              <span>Auto-refresh: Every 10s</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Next update in: {Math.floor(Math.random() * 10) + 1}s</span>
              <span>•</span>
              <span>Data points: {ecData.length}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-6">
          <p>Powered by Lovable • NFT Hydroponic Monitoring System</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;