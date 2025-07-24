import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useRef } from 'react';

interface ECData {
  time: string;
  value: number;
}

interface ECMonitorCardProps {
  currentEC: number;
  data: ECData[];
  unit: 'mS/cm' | 'µS/cm';
  optimalRange: { min: number; max: number };
  onAlarmAcknowledge?: () => void;
}

const ECMonitorCard = ({ currentEC, data, unit, optimalRange, onAlarmAcknowledge }: ECMonitorCardProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getStatus = () => {
    if (currentEC < optimalRange.min) return { status: 'low', color: 'destructive', label: 'Low', isAlarm: true };
    if (currentEC > optimalRange.max) return { status: 'high', color: 'warning', label: 'High', isAlarm: true };
    return { status: 'normal', color: 'success', label: 'Normal', isAlarm: false };
  };

  const status = getStatus();
  
  const trend = data.length >= 2 ? 
    data[data.length - 1].value - data[data.length - 2].value : 0;

  // Create alarm beep sound effect
  useEffect(() => {
    if (status.isAlarm && !audioRef.current) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const createBeep = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // High pitch beep
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      };

      // Play beep every 3 seconds when in alarm state
      const interval = setInterval(() => {
        if (status.isAlarm) {
          createBeep();
        }
      }, 3000);

      // Initial beep
      createBeep();

      return () => clearInterval(interval);
    }
  }, [status.isAlarm]);

  return (
    <Card className={`
      shadow-[var(--shadow-medium)] border-border/50 bg-card/95 backdrop-blur-sm 
      transition-all duration-300
      ${status.isAlarm ? 'ring-2 ring-destructive/50 animate-pulse' : ''}
    `}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            EC Level
            {status.isAlarm && (
              <div className="flex items-center gap-1 ml-2">
                <AlertTriangle className="h-4 w-4 text-destructive animate-bounce" />
                <Volume2 className="h-4 w-4 text-destructive animate-pulse" />
              </div>
            )}
          </CardTitle>
          <Badge 
            variant={status.color === 'success' ? 'default' : 'destructive'}
            className={`
              ${status.color === 'success' ? 'bg-success text-white' : ''}
              ${status.color === 'warning' ? 'bg-warning text-accent-foreground' : ''}
              ${status.color === 'destructive' ? 'bg-destructive text-white' : ''}
              font-medium px-3 py-1
              ${status.isAlarm ? 'animate-pulse' : ''}
            `}
          >
            {status.label}
          </Badge>
        </div>
        
        {status.isAlarm && (
          <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  ALARM: EC {status.status === 'low' ? 'below' : 'above'} threshold!
                </span>
              </div>
              {onAlarmAcknowledge && (
                <button
                  onClick={onAlarmAcknowledge}
                  className="text-xs px-2 py-1 bg-destructive text-white rounded hover:bg-destructive/90 transition-colors"
                >
                  Acknowledge
                </button>
              )}
            </div>
            <p className="text-xs text-destructive/80 mt-1">
              Current: {currentEC.toFixed(1)} {unit} | Range: {optimalRange.min} - {optimalRange.max} {unit}
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold transition-colors ${status.isAlarm ? 'text-destructive' : 'text-foreground'}`}>
            {currentEC.toFixed(1)}
          </span>
          <span className="text-lg text-muted-foreground">{unit}</span>
          {trend !== 0 && (
            <div className="flex items-center gap-1 ml-2">
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={`text-sm ${trend > 0 ? 'text-success' : 'text-destructive'}`}>
                {Math.abs(trend).toFixed(2)}
              </span>
            </div>
          )}
        </div>
        
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                domain={[0.8, 2.6]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  fontSize: '14px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              {/* Threshold lines */}
              <Line
                type="monotone"
                dataKey={() => optimalRange.min}
                stroke="hsl(var(--destructive))"
                strokeWidth={1}
                strokeDasharray="5,5"
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey={() => optimalRange.max}
                stroke="hsl(var(--warning))"
                strokeWidth={1}
                strokeDasharray="5,5"
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={status.isAlarm ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: status.isAlarm ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Optimal range: {optimalRange.min} - {optimalRange.max} {unit}</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-3 h-px bg-destructive"></div>
              Min threshold
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-px bg-warning"></div>
              Max threshold
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ECMonitorCard;