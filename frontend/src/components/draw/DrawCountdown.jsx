import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';

export const DrawCountdown = ({ targetDate, drawName = 'Monthly Impact Draw' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = targetDate ? new Date(targetDate).getTime() : Date.now() + 14 * 86400000;
      const difference = target - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="bg-ink text-canvas rounded-3xl p-6 sm:p-8 border border-pine/30 shadow-soft-lg relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-pine/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-gold-light text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next Live Draw Countdown</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-canvas">
            {drawName}
          </h3>
          <p className="text-xs text-sage/80 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Draw Date: {targetDate ? new Date(targetDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'End of Month'}</span>
          </p>
        </div>

        {/* Numeric Tiles */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Mins', value: timeLeft.minutes },
            { label: 'Secs', value: timeLeft.seconds }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-pine-deep/80 border border-pine/40 rounded-2xl p-2.5 sm:p-3.5 min-w-[64px] sm:min-w-[76px]"
            >
              <span className="font-serif text-2xl sm:text-3xl font-bold text-gold-light block leading-tight">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] tracking-wider uppercase text-sage/70 block mt-0.5">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
