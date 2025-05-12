
'use client';

import { LineChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <LineChart className="mr-3 h-8 w-8 text-primary" />
          Reports Dashboard
        </h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl text-primary">Warehouse Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
            <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">
              Reporting features are under development.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon for insightful data visualizations and analytics on your warehouse operations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
