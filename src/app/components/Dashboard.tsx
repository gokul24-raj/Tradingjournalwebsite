import { useTrades } from '../hooks/useTrades';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { Link } from 'react-router';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function Dashboard() {
  const { trades } = useTrades();

  // Calculate statistics
  const closedTrades = trades.filter((t) => t.status === 'closed');
  const totalProfitLoss = closedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
  const winningTrades = closedTrades.filter((t) => (t.profitLoss || 0) > 0);
  const losingTrades = closedTrades.filter((t) => (t.profitLoss || 0) < 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  const openTrades = trades.filter((t) => t.status === 'open');

  // Prepare chart data (last 10 closed trades cumulative P&L)
  const chartData = closedTrades
    .slice()
    .reverse()
    .slice(-10)
    .reduce((acc: any[], trade, index) => {
      const previousTotal = index > 0 ? acc[index - 1].total : 0;
      const total = previousTotal + (trade.profitLoss || 0);
      acc.push({
        name: trade.symbol,
        total,
        date: trade.exitDate,
      });
      return acc;
    }, []);

  // Win/Loss distribution
  const distributionData = [
    { name: 'Wins', value: winningTrades.length, color: '#10b981' },
    { name: 'Losses', value: losingTrades.length, color: '#ef4444' },
  ];

  // Recent trades
  const recentTrades = trades.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your trading performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total P&L
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ${totalProfitLoss.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From {closedTrades.length} closed trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Win Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {winRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {winningTrades.length} wins, {losingTrades.length} losses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Open Trades
            </CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {openTrades.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently active positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Trades
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{trades.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {closedTrades.length} closed, {openTrades.length} open
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cumulative P&L</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    fill="#93c5fd"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No closed trades yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {closedTrades.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No closed trades yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Symbol
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Entry Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      P&L
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {trade.symbol}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                            trade.type === 'long'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {trade.entryDate}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                            trade.status === 'open'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {trade.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {trade.profitLoss !== undefined ? (
                          <span
                            className={`font-medium ${
                              trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            ${trade.profitLoss.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/trade/${trade.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No trades yet. <Link to="/add-trade" className="text-blue-600">Add your first trade</Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
