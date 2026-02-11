import { useState, useEffect } from 'react';

export interface Trade {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  entryDate: string;
  exitDate?: string;
  profitLoss?: number;
  profitLossPercent?: number;
  notes?: string;
  strategy?: string;
  status: 'open' | 'closed';
}

const STORAGE_KEY = 'trading_journal_trades';

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    // Return sample data for demo
    return [
      {
        id: '1',
        symbol: 'AAPL',
        type: 'long',
        quantity: 100,
        entryPrice: 150.50,
        exitPrice: 158.25,
        entryDate: '2026-01-15',
        exitDate: '2026-01-28',
        profitLoss: 775,
        profitLossPercent: 5.15,
        notes: 'Strong earnings report expected',
        strategy: 'Swing Trading',
        status: 'closed',
      },
      {
        id: '2',
        symbol: 'TSLA',
        type: 'short',
        quantity: 50,
        entryPrice: 245.80,
        exitPrice: 238.40,
        entryDate: '2026-01-20',
        exitDate: '2026-02-03',
        profitLoss: 370,
        profitLossPercent: 3.01,
        notes: 'Overbought on technicals',
        strategy: 'Mean Reversion',
        status: 'closed',
      },
      {
        id: '3',
        symbol: 'NVDA',
        type: 'long',
        quantity: 75,
        entryPrice: 520.30,
        entryDate: '2026-02-05',
        notes: 'AI chip demand increasing',
        strategy: 'Position Trading',
        status: 'open',
      },
      {
        id: '4',
        symbol: 'MSFT',
        type: 'long',
        quantity: 60,
        entryPrice: 385.60,
        exitPrice: 372.15,
        entryDate: '2026-01-22',
        exitDate: '2026-02-01',
        profitLoss: -807,
        profitLossPercent: -3.49,
        notes: 'Cloud growth concerns',
        strategy: 'Swing Trading',
        status: 'closed',
      },
      {
        id: '5',
        symbol: 'GOOGL',
        type: 'long',
        quantity: 40,
        entryPrice: 142.80,
        exitPrice: 149.20,
        entryDate: '2026-01-10',
        exitDate: '2026-01-25',
        profitLoss: 256,
        profitLossPercent: 4.48,
        notes: 'Ad revenue recovery',
        strategy: 'Swing Trading',
        status: 'closed',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }, [trades]);

  const addTrade = (trade: Omit<Trade, 'id'>) => {
    const newTrade: Trade = {
      ...trade,
      id: Date.now().toString(),
    };
    setTrades((prev) => [newTrade, ...prev]);
    return newTrade;
  };

  const updateTrade = (id: string, updates: Partial<Trade>) => {
    setTrades((prev) =>
      prev.map((trade) => (trade.id === id ? { ...trade, ...updates } : trade))
    );
  };

  const deleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((trade) => trade.id !== id));
  };

  const closeTrade = (id: string, exitPrice: number, exitDate: string, notes?: string) => {
    setTrades((prev) =>
      prev.map((trade) => {
        if (trade.id === id) {
          const profitLoss =
            trade.type === 'long'
              ? (exitPrice - trade.entryPrice) * trade.quantity
              : (trade.entryPrice - exitPrice) * trade.quantity;
          const profitLossPercent =
            trade.type === 'long'
              ? ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100
              : ((trade.entryPrice - exitPrice) / trade.entryPrice) * 100;

          return {
            ...trade,
            exitPrice,
            exitDate,
            profitLoss,
            profitLossPercent,
            notes: notes || trade.notes,
            status: 'closed' as const,
          };
        }
        return trade;
      })
    );
  };

  return {
    trades,
    addTrade,
    updateTrade,
    deleteTrade,
    closeTrade,
  };
}
