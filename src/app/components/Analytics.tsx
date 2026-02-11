import { useTrades } from '../hooks/useTrades';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export function Analytics() {
  const { trades } = useTrades();
  const closedTrades = trades.filter((t) => t.status === 'closed');

  // Strategy performance
  const strategyStats = closedTrades.reduce((acc: any, trade) => {
    const strategy = trade.strategy || 'Unknown';
    if (!acc[strategy]) {
      acc[strategy] = { wins: 0, losses: 0, totalPL: 0, count: 0 };
    }
    acc[strategy].count++;
    acc[strategy].totalPL += trade.profitLoss || 0;
    if ((trade.profitLoss || 0) > 0) {
      acc[strategy].wins++;
    } else {
      acc[strategy].losses++;
    }
    return acc;
  }, {});

  const strategyData = Object.entries(strategyStats).map(([name, stats]: [string, any]) => ({
    name,
    winRate: ((stats.wins / stats.count) * 100).toFixed(1),
    totalPL: stats.totalPL.toFixed(2),
    trades: stats.count,
  }));

  // Symbol performance
  const symbolStats = closedTrades.reduce((acc: any, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = { totalPL: 0, count: 0 };
    }
    acc[trade.symbol].totalPL += trade.profitLoss || 0;
    acc[trade.symbol].count++;
    return acc;
  }, {});

  const symbolData = Object.entries(symbolStats)
    .map(([symbol, stats]: [string, any]) => ({
      symbol,
      totalPL: stats.totalPL,
      avgPL: stats.totalPL / stats.count,
      trades: stats.count,
    }))
    .sort((a, b) => b.totalPL - a.totalPL)
    .slice(0, 10);

  // Monthly performance
  const monthlyStats = closedTrades.reduce((acc: any, trade) => {
    const month = trade.exitDate?.substring(0, 7) || '';
    if (!month) return acc;
    if (!acc[month]) {
      acc[month] = { totalPL: 0, trades: 0 };
    }
    acc[month].totalPL += trade.profitLoss || 0;
    acc[month].trades++;
    return acc;
  }, {});

  const monthlyData = Object.entries(monthlyStats)
    .map(([month, stats]: [string, any]) => ({
      month,
      totalPL: stats.totalPL,
      trades: stats.trades,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Calculate overall stats
  const totalProfitLoss = closedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
  const winningTrades = closedTrades.filter((t) => (t.profitLoss || 0) > 0);
  const losingTrades = closedTrades.filter((t) => (t.profitLoss || 0) < 0);
  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) / winningTrades.length
    : 0;
  const avgLoss = losingTrades.length > 0
    ? losingTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) / losingTrades.length
    : 0;
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
  const largestWin = Math.max(...closedTrades.map(t => t.profitLoss || 0), 0);
  const largestLoss = Math.min(...closedTrades.map(t => t.profitLoss || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Deep dive into your trading performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Win
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${avgWin.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${avgLoss.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Profit Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {profitFactor.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Largest Win
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${largestWin.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalPL" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Symbols by P&L</CardTitle>
          </CardHeader>
          <CardContent>
            {symbolData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={symbolData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="symbol" type="category" width={60} />
                  <Tooltip />
                  <Bar dataKey="totalPL" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategy Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {strategyData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Strategy
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Total Trades
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Win Rate
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Total P&L
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {strategyData.map((strategy) => (
                    <tr key={strategy.name} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {strategy.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{strategy.trades}</td>
                      <td className="py-3 px-4 text-gray-600">{strategy.winRate}%</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-medium ${
                            parseFloat(strategy.totalPL) >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          ${strategy.totalPL}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No strategy data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
