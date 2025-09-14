
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ActivityChartProps {
  title: string;
  data: Array<{
    date: string;
    seances: number;
    commentaires: number;
    documents: number;
  }>;
  className?: string;
}

export function ActivityChart({ title, data, className }: ActivityChartProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              labelFormatter={(value) => formatDate(value)}
            />
            <Area 
              type="monotone" 
              dataKey="seances" 
              stackId="1"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
              name="Séances"
            />
            <Area 
              type="monotone" 
              dataKey="commentaires" 
              stackId="1"
              stroke="hsl(142 76% 36%)"
              fill="hsl(142 76% 36%)"
              fillOpacity={0.6}
              name="Commentaires"
            />
            <Area 
              type="monotone" 
              dataKey="documents" 
              stackId="1"
              stroke="hsl(47 96% 53%)"
              fill="hsl(47 96% 53%)"
              fillOpacity={0.6}
              name="Documents"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
