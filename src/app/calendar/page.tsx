
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWarehouse } from '@/contexts/WarehouseContext';
import type { Trailer } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import {
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  parseISO,
} from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to generate a unique key for a date (YYYY-MM-DD)
const getDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export default function WeeklyCalendarPage() {
  const { trailers } = useWarehouse();
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date()); // Date to determine the current week

  useEffect(() => {
    setIsClient(true);
  }, []);

  const weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1; // Monday

  const currentWeekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn }), [currentDate]);
  const currentWeekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn }), [currentDate]);
  
  const weekDays = useMemo(() => {
    return eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });
  }, [currentWeekStart, currentWeekEnd]);

  const trailersByArrivalDate = useMemo(() => {
    const byDay: { [dateKey: string]: Trailer[] } = {};
    if (!isClient) return byDay; // Ensure trailers are loaded on client

    trailers.forEach(trailer => {
      if (trailer.arrivalDate) {
        try {
          const arrival = parseISO(trailer.arrivalDate);
          const key = getDateKey(arrival);
          if (!byDay[key]) {
            byDay[key] = [];
          }
          byDay[key].push(trailer);
        } catch (error) {
          console.error("Error parsing trailer arrival date:", trailer.arrivalDate, error);
        }
      }
    });
    return byDay;
  }, [trailers, isClient]);

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const weekRangeFormatted = `${format(currentWeekStart, 'MMM d')} - ${format(currentWeekEnd, 'MMM d, yyyy')}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card rounded-lg shadow">
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <CalendarDays className="mr-3 h-8 w-8 text-primary" />
          Weekly Arrival Calendar
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreviousWeek} aria-label="Previous week">
            <ArrowLeft className="h-4 w-4 mr-0 sm:mr-2" /> <span className="hidden sm:inline">Prev</span>
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" onClick={handleNextWeek} aria-label="Next week">
             <span className="hidden sm:inline">Next</span><ArrowRight className="h-4 w-4 ml-0 sm:ml-2" />
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-2xl text-primary">{weekRangeFormatted}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-7 border-t border-l border-border">
            {weekDays.map(day => (
              <div key={getDateKey(day)} className={`border-b border-r border-border min-h-[150px] flex flex-col ${isToday(day) ? 'bg-primary/5' : ''}`}>
                <div className={`p-2 text-center font-medium text-sm sm:text-base border-b border-border ${isToday(day) ? 'bg-primary/10 text-primary font-bold' : 'bg-card'}`}>
                  <div>{format(day, 'EEE')}</div>
                  <div className={`text-lg sm:text-xl ${isToday(day) ? 'text-primary' : ''}`}>{format(day, 'd')}</div>
                </div>
                <div className="p-1.5 sm:p-2 flex-grow space-y-1 overflow-y-auto max-h-[200px] sm:max-h-[250px]">
                  {isClient && trailersByArrivalDate[getDateKey(day)]?.map(trailer => (
                    <Link href={`/trailers/${trailer.id}`} key={trailer.id} legacyBehavior>
                      <a className="block p-1.5 bg-background hover:bg-secondary rounded-md text-xs sm:text-sm shadow-sm transition-all border border-border hover:border-primary/50">
                        <p className="font-semibold text-primary truncate" title={trailer.id}>{trailer.id}</p>
                        {trailer.name && <p className="text-muted-foreground truncate" title={trailer.name}>{trailer.name}</p>}
                      </a>
                    </Link>
                  ))}
                  {isClient && !trailersByArrivalDate[getDateKey(day)] && (
                    <div className="text-xs text-muted-foreground text-center pt-4 italic">No arrivals</div>
                  )}
                  {!isClient && (
                     <div className="space-y-1 p-1.5">
                       <Skeleton className="h-10 w-full" />
                       <Skeleton className="h-10 w-full" />
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
