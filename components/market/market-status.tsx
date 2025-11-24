'use client';

import { useEffect, useState } from 'react';

export function MarketStatus() {
  const [isOpen, setIsOpen] = useState(true);
  const [timeToClose, setTimeToClose] = useState('');

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const day = now.getDay();

      // IST market hours: 9:15 AM - 3:30 PM, Monday-Friday
      const isWeekday = day > 0 && day < 6;
      const currentTime = hours * 60 + minutes;
      const openTime = 9 * 60 + 15; // 9:15 AM
      const closeTime = 15 * 60 + 30; // 3:30 PM

      const open = isWeekday && currentTime >= openTime && currentTime <= closeTime;
      setIsOpen(open);

      if (open) {
        const minutesLeft = closeTime - currentTime;
        const hoursLeft = Math.floor(minutesLeft / 60);
        const minsLeft = minutesLeft % 60;
        setTimeToClose(`${hoursLeft}h ${minsLeft}m`);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
      <span className={`text-sm font-semibold ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
        {isOpen ? `Market Open • Closes in ${timeToClose}` : 'Market Closed'}
      </span>
    </div>
  );
}
