import { useState, useEffect } from 'react';

export interface TradingGoals {
  dailyMaxLoss: number;
  weeklyTarget: number;
  maxTradesPerDay: number;
  riskPercentRule: number;
  minRiskRewardRatio: number;
  allowedSessions: string[];
  maxConsecutiveLosses: number;
}

const STORAGE_KEY = 'trading_journal_goals';

const defaultGoals: TradingGoals = {
  dailyMaxLoss: 200,
  weeklyTarget: 500,
  maxTradesPerDay: 3,
  riskPercentRule: 1,
  minRiskRewardRatio: 1.5,
  allowedSessions: ['London', 'NY'],
  maxConsecutiveLosses: 3,
};

export function useGoals() {
  const [goals, setGoals] = useState<TradingGoals>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultGoals;
      }
    }
    return defaultGoals;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const updateGoals = (newGoals: Partial<TradingGoals>) => {
    setGoals((prev) => ({ ...prev, ...newGoals }));
  };

  const resetGoals = () => {
    setGoals(defaultGoals);
  };

  return {
    goals,
    updateGoals,
    resetGoals,
  };
}
