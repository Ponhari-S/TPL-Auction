import React, { useEffect, useState } from 'react'

const CountdownTimer = ({ timerEndsAt, onFinalCallChange, disableFinalCallStyle = false }) => {
    const [secondsLeft, setSecondsLeft] = useState(0);

    useEffect(() => {
        if (!timerEndsAt) {
            setSecondsLeft(0);
            return;
        }
        const calculate = () => {
            const diff = new Date(timerEndsAt).getTime() - Date.now();
            const seconds = Math.max(0, Math.ceil(diff / 1000));
            setSecondsLeft(seconds);
        };
        calculate();
        const interval = setInterval(calculate, 250);
        return () => {
            clearInterval(interval);
        }
    }, [timerEndsAt]);

    const isUrgent = secondsLeft <= 5 && secondsLeft >= 0;
    const isFinalCall = !disableFinalCallStyle && secondsLeft <= 3 && secondsLeft >= 0;

    useEffect(()=>{
      onFinalCallChange?.(isFinalCall);
    },[isFinalCall]);

  return (
    <div className="text-center">
      <p className={`font-display text-5xl tabular-nums tracking-wide ${isFinalCall ? 'text-6xl text-red-500 animate-pulse' : isUrgent ? 'text-5xl text-red-500 animate-pulse' : 'text-5xl text-white'}`}>
        {secondsLeft}s
      </p>
    </div>
  )
}

export default CountdownTimer;