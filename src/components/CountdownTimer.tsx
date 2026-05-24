import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: string;
  endTime?: string | null;
}

export default function CountdownTimer({ endDate, endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const compute = () => {
      const end = endTime
        ? new Date(`${endDate}T${endTime}`)
        : new Date(`${endDate}T23:59:59`);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setUrgent(diff < 1000 * 60 * 60 * 24);

      if (days > 0) setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      else setTimeLeft(`${minutes}m ${seconds}s`);
    };

    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [endDate, endTime]);

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${urgent ? 'text-red-600' : 'text-amber-600'}`}>
      <Clock className="w-3 h-3" />
      {timeLeft}
    </span>
  );
}
