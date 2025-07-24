import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import ECMonitorCard from '@/components/ECMonitorCard';
import WaterLevelCard from '@/components/WaterLevelCard';
import ThresholdSettings from '@/components/ThresholdSettings';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// More realistic EC data generator (1.0 - 2.4 range)
const generateECData = () => {
  const now = new Date();
  const data = [];
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    // More realistic EC range (1.0 - 2.4) with natural variations
    const baseValue = 1.7; // Target around 1.7
    const hourlyVariation = Math.sin(i * 0.1) * 0.3; // Gradual changes over time
    const randomNoise = (Math.random() - 0.5) * 0.2; // Small random fluctuations
    const value = baseValue + hourlyVariation + randomNoise;
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(1.0, Math.min(2.4, value)) // Constrain to 1.0-2.4 range
    });
  }
  
  return data;
};

const Dashboard = () => {
  const [ecData, setECData] = useState(generateECData());
  const [currentEC, setCurrentEC] = useState(1.7);
  const [waterLevel, setWaterLevel] = useState(78);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ecThreshold, setECThreshold] = useState({ min: 1.2, max: 2.0 });
  const [alarmAcknowledged, setAlarmAcknowledged] = useState(false);
  const { toast } = useToast();

  // Check if current EC is in alarm state
  const isECAlarm = currentEC < ecThreshold.min || currentEC > ecThreshold.max;

  // Simulate real-time data updates with more realistic EC variations
  useEffect(() => {
    const interval = setInterval(() => {
      // More realistic EC variations (1.0-2.4 range)
      const variation = (Math.random() - 0.5) * 0.15; // Smaller variations for realism
      const newEC = Math.max(1.0, Math.min(2.4, currentEC + variation));
      setCurrentEC(newEC);
      
      // Simulate gradual water level changes
      const levelVariation = (Math.random() - 0.5) * 1.5; // Slower water level changes
      const newLevel = Math.max(0, Math.min(100, waterLevel + levelVariation));
      setWaterLevel(newLevel);
      
      // Update data array
      const newDataPoint = {
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: newEC
      };
      
      setECData(prev => [...prev.slice(1), newDataPoint]);
      setLastUpdate(new Date());
      
      // Reset alarm acknowledgment if EC returns to normal
      if (!isECAlarm) {
        setAlarmAcknowledged(false);
      }
      
      // Simulate occasional connection issues
      setIsOnline(Math.random() > 0.02);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [currentEC, waterLevel, isECAlarm]);

  // Show alarm toast when EC goes out of range
  useEffect(() => {
    if (isECAlarm && !alarmAcknowledged) {
      const alarmType = currentEC < ecThreshold.min ? 'below' : 'above';
      toast({
        title: "EC ALARM",
        description: `EC level is ${alarmType} threshold (${currentEC.toFixed(1)} mS/cm)`,
        variant: "destructive",
      });
    }
  }, [isECAlarm, alarmAcknowledged, currentEC, ecThreshold, toast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setECData(generateECData());
      setCurrentEC(1.4 + Math.random() * 0.6); // Random realistic EC value
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
    // Create CSV data
    const csvData = [
      ['Timestamp', 'EC (mS/cm)', 'Water Level (%)'],
      ...ecData.map((point, index) => [
        point.time,
        point.value.toFixed(2),
        (waterLevel + (Math.random() - 0.5) * 5).toFixed(1) // Simulate historical water levels
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydroponic-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Download complete",
      description: "Data exported successfully as CSV file.",
    });
  };

  const handleThresholdUpdate = (newRange: { min: number; max: number }) => {
    setECThreshold(newRange);
    setAlarmAcknowledged(false); // Reset acknowledgment with new thresholds
  };

  const handleAlarmAcknowledge = () => {
    setAlarmAcknowledged(true);
    toast({
      title: "Alarm acknowledged",
      description: "EC alarm has been acknowledged by operator.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <DashboardHeader
          farmName="GreenGrow NFT Farm"
          lastUpdate={lastUpdate}
          isOnline={isOnline}
        />
        
        {/* Global alarm indicator */}
        {isECAlarm && !alarmAcknowledged && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive animate-bounce" />
                <div>
                  <h3 className="font-semibold text-destructive">SYSTEM ALARM</h3>
                  <p className="text-sm text-destructive/80">
                    EC level is {currentEC < ecThreshold.min ? 'below' : 'above'} acceptable range
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleAlarmAcknowledge}
              >
                Acknowledge Alarm
              </Button>
            </div>
          </div>
        )}
        
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
          
          <ThresholdSettings
            currentRange={ecThreshold}
            onRangeUpdate={handleThresholdUpdate}
            unit="mS/cm"
          />
          
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
            optimalRange={ecThreshold}
            onAlarmAcknowledge={handleAlarmAcknowledge}
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
              <span className={isECAlarm ? 'text-destructive font-medium' : ''}>
                System Status: {isECAlarm ? 'ALARM' : isOnline ? 'Online' : 'Offline'}
              </span>
              <span>•</span>
              <span>Auto-refresh: Every 10s</span>
              <span>•</span>
              <span>EC Range: {ecThreshold.min} - {ecThreshold.max} mS/cm</span>
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