
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Database, Wifi, HardDrive } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  networkRequests: number;
  cacheHitRate: number;
}

export function PerformanceOptimizer() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    cacheHitRate: 0
  });

  useEffect(() => {
    // Collecter les métriques de performance
    const collectMetrics = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        
        // Estimation de l'utilisation mémoire (si disponible)
        const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
        
        // Compter les requêtes réseau
        const networkRequests = performance.getEntriesByType('resource').length;
        
        setMetrics({
          loadTime: Math.round(loadTime),
          memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
          networkRequests,
          cacheHitRate: Math.random() * 100 // Simulation pour l'exemple
        });
      }
    };

    collectMetrics();
    const interval = setInterval(collectMetrics, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const optimizePerformance = () => {
    // Nettoyage du cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('old')) {
            caches.delete(name);
          }
        });
      });
    }

    // Forcer le garbage collection (si possible)
    if ((window as any).gc) {
      (window as any).gc();
    }

    console.log('Optimisation des performances effectuée');
  };

  const getPerformanceStatus = (metric: string, value: number) => {
    switch (metric) {
      case 'loadTime':
        if (value < 2000) return { status: 'excellent', color: 'bg-green-100 text-green-800' };
        if (value < 5000) return { status: 'bon', color: 'bg-yellow-100 text-yellow-800' };
        return { status: 'lent', color: 'bg-red-100 text-red-800' };
      
      case 'memoryUsage':
        if (value < 50) return { status: 'optimal', color: 'bg-green-100 text-green-800' };
        if (value < 100) return { status: 'correct', color: 'bg-yellow-100 text-yellow-800' };
        return { status: 'élevé', color: 'bg-red-100 text-red-800' };
      
      default:
        return { status: 'normal', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Optimisation des Performances</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Temps de chargement</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{metrics.loadTime}ms</span>
              <Badge className={getPerformanceStatus('loadTime', metrics.loadTime).color}>
                {getPerformanceStatus('loadTime', metrics.loadTime).status}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Mémoire utilisée</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{metrics.memoryUsage}MB</span>
              <Badge className={getPerformanceStatus('memoryUsage', metrics.memoryUsage).color}>
                {getPerformanceStatus('memoryUsage', metrics.memoryUsage).status}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Requêtes réseau</span>
            </div>
            <span className="font-medium">{metrics.networkRequests}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Taux de cache</span>
            </div>
            <span className="font-medium">{metrics.cacheHitRate.toFixed(1)}%</span>
          </div>
        </div>

        <Button onClick={optimizePerformance} className="w-full">
          <Zap className="w-4 h-4 mr-2" />
          Optimiser les performances
        </Button>
      </CardContent>
    </Card>
  );
}
