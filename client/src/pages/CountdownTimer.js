import React, { useEffect, useState } from 'react'

const CountdownTimer = ({ timerEndsAt }) => {
    const [secondsLeft, setSecondsLeft] = useState(0);

    useEffect(() => {
        if (!timerEndsAt) {
            setSecondsLeft(0);
            return;
        }
        const calculate = () => {
            const seconds = new Date(timerEndsAt).getTime() - Date.now();
            setSecondsLeft(Math.max(0, Math.ceil(seconds / 1000)));
        };
        calculate();
        const interval = setInterval(calculate, 250);
        return () => {
            clearInterval(interval);
        }
    }, [timerEndsAt]);

    const isUrgent = secondsLeft <= 5 && secondsLeft >= 0;

  return (
    <div className="text-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
      `}</style>
      <p className={`font-display text-5xl tabular-nums tracking-wide ${isUrgent ? 'text-red-500 animate-pulse' : 'text-[#f4b942]'}`}>
        {secondsLeft}s
      </p>
    </div>
  )
}

export default CountdownTimer;