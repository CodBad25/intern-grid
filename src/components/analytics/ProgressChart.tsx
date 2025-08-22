
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ProgressChartProps {
  title: string;
  data: Array<{
    label: string;
    value: number;
    total: number;
    color?: string;
  }>;
  className?: string;
}

export function ProgressChart({ title, data, className }: ProgressChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => {
          const percentage = Math.round((item.value / item.total) * 100);
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {item.value}/{item.total}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {percentage}%
                  </Badge>
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{
                  '--progress-foreground': item.color || 'hsl(var(--primary))'
                } as any}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
