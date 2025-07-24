import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ECData {
  time: string;
  value: number;
}

interface ECMonitorCardProps {
  currentEC: number;
  data: ECData[];
  unit: 'mS/cm' | 'µS/cm';
  optimalRange: { min: number; max: number };
}

const ECMonitorCard = ({ currentEC, data, unit, optimalRange }: ECMonitorCardProps) => {
  const getStatus = () => {
    if (currentEC < optimalRange.min) return { status: 'low', color: 'destructive', label: 'Low' };
    if (currentEC > optimalRange.max) return { status: 'high', color: 'warning', label: 'High' };
    return { status: 'normal', color: 'success', label: 'Normal' };
  };

  const status = getStatus();
  
  const trend = data.length >= 2 ? 
    data[data.length - 1].value - data[data.length - 2].value : 0;

  return (
    <Card className="shadow-[var(--shadow-medium)] border-border/50 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            EC Level
          </CardTitle>
          <Badge 
            variant={status.color === 'success' ? 'default' : 'destructive'}
            className={`
              ${status.color === 'success' ? 'bg-success text-white' : ''}
              ${status.color === 'warning' ? 'bg-warning text-accent-foreground' : ''}
              ${status.color === 'destructive' ? 'bg-destructive text-white' : ''}
              font-medium px-3 py-1
            `}
          >
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
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
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
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
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Optimal range: {optimalRange.min} - {optimalRange.max} {unit}
        </div>
      </CardContent>
    </Card>
  );
};

export default ECMonitorCard;