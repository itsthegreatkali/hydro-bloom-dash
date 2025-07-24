import { Droplets, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WaterLevelCardProps {
  level: number; // percentage (0-100)
  height?: number; // optional height in mm
  lowThreshold?: number; // percentage below which level is considered low
}

const WaterLevelCard = ({ level, height, lowThreshold = 20 }: WaterLevelCardProps) => {
  const isLow = level < lowThreshold;
  const isCritical = level < 10;
  
  const getStatusColor = () => {
    if (isCritical) return 'destructive';
    if (isLow) return 'warning';
    return 'success';
  };

  const getStatusLabel = () => {
    if (isCritical) return 'Critical';
    if (isLow) return 'Low';
    return 'Normal';
  };

  return (
    <Card className="shadow-[var(--shadow-medium)] border-border/50 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Droplets className="h-5 w-5 text-secondary" />
            Water Level
          </CardTitle>
          <Badge 
            variant={getStatusColor() === 'success' ? 'default' : 'destructive'}
            className={`
              ${getStatusColor() === 'success' ? 'bg-success text-white' : ''}
              ${getStatusColor() === 'warning' ? 'bg-warning text-accent-foreground' : ''}
              ${getStatusColor() === 'destructive' ? 'bg-destructive text-white' : ''}
              font-medium px-3 py-1
            `}
          >
            {getStatusLabel()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            {level.toFixed(0)}%
          </span>
          {height && (
            <span className="text-lg text-muted-foreground">
              ({height}mm)
            </span>
          )}
          {isLow && (
            <AlertTriangle className="h-5 w-5 text-warning ml-2" />
          )}
        </div>
        
        {/* Tank Visualization */}
        <div className="relative">
          <div className="w-full h-40 bg-gradient-to-t from-muted to-muted/50 rounded-lg border-2 border-border relative overflow-hidden">
            {/* Water fill */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary to-secondary/70 transition-all duration-1000 ease-out rounded-b-md"
              style={{ height: `${Math.max(level, 2)}%` }}
            >
              {/* Water surface animation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary/50 via-secondary to-secondary/50 animate-pulse" />
            </div>
            
            {/* Level markers */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
              {[100, 75, 50, 25, 0].map((mark) => (
                <div key={mark} className="flex items-center justify-between">
                  <div className="w-2 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">{mark}%</span>
                  <div className="w-2 h-px bg-border" />
                </div>
              ))}
            </div>
            
            {/* Current level indicator */}
            <div 
              className="absolute left-0 right-0 h-px bg-foreground/60 flex items-center"
              style={{ bottom: `${level}%` }}
            >
              <div className="w-full h-px bg-foreground/60" />
              <div className="absolute -right-1 w-2 h-2 bg-foreground rounded-full border border-background" />
            </div>
          </div>
          
          {/* Tank label */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2">
            <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border">
              Sump Tank
            </span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Low threshold: {lowThreshold}% • Critical: 10%
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterLevelCard;