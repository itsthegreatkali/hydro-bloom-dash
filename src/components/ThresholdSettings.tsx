import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThresholdRange {
  min: number;
  max: number;
}

interface ThresholdSettingsProps {
  currentRange: ThresholdRange;
  onRangeUpdate: (range: ThresholdRange) => void;
  unit: string;
}

const ThresholdSettings = ({ currentRange, onRangeUpdate, unit }: ThresholdSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [minValue, setMinValue] = useState(currentRange.min.toString());
  const [maxValue, setMaxValue] = useState(currentRange.max.toString());
  const { toast } = useToast();

  const handleSave = () => {
    const min = parseFloat(minValue);
    const max = parseFloat(maxValue);

    // Validation
    if (isNaN(min) || isNaN(max)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers for both minimum and maximum values.",
        variant: "destructive",
      });
      return;
    }

    if (min >= max) {
      toast({
        title: "Invalid range",
        description: "Minimum value must be less than maximum value.",
        variant: "destructive",
      });
      return;
    }

    if (min < 0.5 || max > 3.0) {
      toast({
        title: "Out of range",
        description: "Values must be between 0.5 and 3.0 mS/cm for safety.",
        variant: "destructive",
      });
      return;
    }

    onRangeUpdate({ min, max });
    setIsOpen(false);
    toast({
      title: "Threshold updated",
      description: `EC range set to ${min} - ${max} ${unit}`,
    });
  };

  const handleReset = () => {
    const defaultRange = { min: 1.2, max: 2.0 };
    setMinValue(defaultRange.min.toString());
    setMaxValue(defaultRange.max.toString());
    onRangeUpdate(defaultRange);
    toast({
      title: "Threshold reset",
      description: `EC range reset to default (${defaultRange.min} - ${defaultRange.max} ${unit})`,
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset form values when opening
      setMinValue(currentRange.min.toString());
      setMaxValue(currentRange.max.toString());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-card/50 backdrop-blur-sm">
          <Settings className="h-4 w-4" />
          Threshold
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            EC Threshold Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-threshold">Minimum ({unit})</Label>
              <Input
                id="min-threshold"
                type="number"
                step="0.1"
                min="0.5"
                max="2.9"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                placeholder="1.2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-threshold">Maximum ({unit})</Label>
              <Input
                id="max-threshold"
                type="number"
                step="0.1"
                min="0.6"
                max="3.0"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                placeholder="2.0"
              />
            </div>
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Current range:</strong> {currentRange.min} - {currentRange.max} {unit}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Safe range: 0.5 - 3.0 {unit}
            </p>
          </div>
          
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
            
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThresholdSettings;