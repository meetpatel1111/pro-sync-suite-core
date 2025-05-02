import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TimesheetTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div>
      <h2>Timesheet</h2>
      <p>Selected Date: {format(selectedDate, 'PPP')}</p>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimesheetTab;
