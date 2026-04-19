import { format, getDay, isToday } from 'date-fns';

interface WeeklyBarsProps {
  data: Array<{ date: Date; value: number; label?: string }>;
  maxValue?: number;
}

const WeeklyBars = ({ data, maxValue }: WeeklyBarsProps) => {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  // Ensure we have 7 bars
  const bars = dayNames.map((dayName, index) => {
    const dayData = data.find((d) => getDay(d.date) === index + 1);
    return {
      day: dayName,
      value: dayData?.value || 0,
      isToday: dayData ? isToday(dayData.date) : false,
      label: dayData?.label,
    };
  });

  return (
    <div className="flex items-end justify-between gap-2 h-48">
      {bars.map((bar, index) => {
        const height = (bar.value / max) * 100;
        
        return (
          <div key={index} className="flex-1 flex flex-col items-center group">
            <div className="w-full flex flex-col items-center">
              {/* Tooltip */}
              {bar.value > 0 && (
                <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium text-text-primary bg-white px-2 py-1 rounded-pill shadow-soft">
                    {bar.label || bar.value}h
                  </span>
                </div>
              )}
              
              {/* Bar */}
              <div className="w-full flex flex-col justify-end h-32">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    bar.isToday
                      ? 'bg-accent'
                      : bar.value > 0
                      ? 'bg-blue-200'
                      : 'bg-gray-200'
                  }`}
                  style={{ height: `${Math.max(height, bar.value > 0 ? 8 : 0)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Day label */}
            <div className="mt-2">
              <div
                className={`text-xs font-medium ${
                  bar.isToday ? 'text-accent-dark font-bold' : 'text-text-muted'
                }`}
              >
                {bar.day}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyBars;

