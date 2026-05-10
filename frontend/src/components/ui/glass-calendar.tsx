import * as React from "react";
import { Settings, Plus, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, addMonths, subMonths, addWeeks, subWeeks, isSameDay, isToday, getDate, getDaysInMonth, startOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Day {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
}

interface GlassCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
}

const ScrollbarHide = () => (
  <style>{`
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}</style>
);

export const GlassCalendar = React.forwardRef<HTMLDivElement, GlassCalendarProps>(
  ({ className, selectedDate: propSelectedDate, onDateSelect, ...props }, ref) => {
    const [currentDate, setCurrentDate] = React.useState(propSelectedDate || new Date());
    const [selectedDate, setSelectedDate] = React.useState(propSelectedDate || new Date());
    const [viewMode, setViewMode] = React.useState<'monthly' | 'weekly'>('monthly');
    const navigate = useNavigate();

    const calendarDays = React.useMemo(() => {
        if (viewMode === 'monthly') {
          const start = startOfMonth(currentDate);
          const totalDays = getDaysInMonth(currentDate);
          const days: Day[] = [];
          for (let i = 0; i < totalDays; i++) {
              const date = new Date(start.getFullYear(), start.getMonth(), i + 1);
              days.push({
                  date,
                  isToday: isToday(date),
                  isSelected: isSameDay(date, selectedDate),
              });
          }
          return days;
        } else {
          // Weekly view
          const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start week on Monday
          const end = endOfWeek(currentDate, { weekStartsOn: 1 });
          const daysArray = eachDayOfInterval({ start, end });
          return daysArray.map(date => ({
              date,
              isToday: isToday(date),
              isSelected: isSameDay(date, selectedDate),
          }));
        }
    }, [currentDate, selectedDate, viewMode]);

    const handleDateClick = (date: Date) => {
      setSelectedDate(date);
      if (viewMode === 'weekly') {
          setCurrentDate(date);
      }
      onDateSelect?.(date);
    };
    
    const handlePrev = () => {
        if (viewMode === 'monthly') {
            setCurrentDate(subMonths(currentDate, 1));
        } else {
            setCurrentDate(subWeeks(currentDate, 1));
        }
    };

    const handleNext = () => {
        if (viewMode === 'monthly') {
            setCurrentDate(addMonths(currentDate, 1));
        } else {
            setCurrentDate(addWeeks(currentDate, 1));
        }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-[360px] rounded-[2.5rem] p-6 shadow-2xl overflow-hidden",
          "bg-white/80 backdrop-blur-3xl border border-white/40",
          "text-gray-900 font-sans",
          className
        )}
        {...props}
      >
        <ScrollbarHide />
        {/* Header: Tabs and Settings */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1 rounded-xl bg-gray-100/50 p-1 border border-white/50 backdrop-blur-md">
            <button 
              onClick={() => setViewMode('weekly')}
              className={cn("rounded-lg px-4 py-1.5 text-xs font-black transition-all", viewMode === 'weekly' ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-900")}
            >
              Weekly
            </button>
            <button 
              onClick={() => setViewMode('monthly')}
              className={cn("rounded-lg px-4 py-1.5 text-xs font-black transition-all", viewMode === 'monthly' ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-900")}
            >
              Monthly
            </button>
          </div>
          <button className="p-2 text-gray-400 transition-colors hover:text-purple-600 hover:bg-purple-50 rounded-full">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Date Display and Navigation */}
        <div className="my-6 flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.div 
                key={viewMode === 'monthly' ? format(currentDate, "MMMM yyyy") : `Week ${format(currentDate, "w")}`}
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-1">{format(currentDate, "yyyy")}</span>
                  <span className="text-3xl font-black tracking-tight text-gray-900">{format(currentDate, "MMMM")}</span>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center space-x-2">
                <button onClick={handlePrev} className="p-2 rounded-full text-gray-400 transition-colors hover:text-purple-600 hover:bg-purple-50 bg-gray-50/50">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={handleNext} className="p-2 rounded-full text-gray-400 transition-colors hover:text-purple-600 hover:bg-purple-50 bg-gray-50/50">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>

        {/* Scrollable Calendar Grid */}
        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
            <div className={cn("flex gap-3", viewMode === 'weekly' ? "justify-between" : "")}>
                {calendarDays.map((day) => (
                    <div key={format(day.date, "yyyy-MM-dd")} className="flex flex-col items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] font-black text-gray-400 uppercase">
                            {format(day.date, "E").charAt(0)}
                        </span>
                        <button
                            onClick={() => handleDateClick(day.date)}
                            className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black transition-all duration-300 relative",
                                {
                                    "bg-purple-600 text-white shadow-xl shadow-purple-200 scale-110": day.isSelected,
                                    "bg-white border border-gray-100 hover:border-purple-200 hover:text-purple-600 text-gray-600": !day.isSelected && !day.isToday,
                                    "bg-purple-50 border border-purple-100 text-purple-600": day.isToday && !day.isSelected,
                                }
                            )}
                        >
                            {day.isToday && !day.isSelected && (
                                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-purple-600"></span>
                            )}
                            {getDate(day.date)}
                        </button>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Divider */}
        <div className="mt-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between">
           <button className="flex items-center space-x-2 text-xs font-bold text-gray-400 transition-colors hover:text-purple-600">
             <Edit2 className="h-3.5 w-3.5" />
             <span>Add Note</span>
           </button>
           <button 
             onClick={() => navigate('/create-trip', { state: { prefillDate: format(selectedDate, 'yyyy-MM-dd') } })}
             className="flex items-center space-x-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-black text-white shadow-xl shadow-gray-200 transition-all hover:bg-gray-800 active:scale-95"
           >
             <Plus className="h-3.5 w-3.5" />
             <span>New Event</span>
           </button>
        </div>
      </div>
    );
  }
);

GlassCalendar.displayName = "GlassCalendar";
