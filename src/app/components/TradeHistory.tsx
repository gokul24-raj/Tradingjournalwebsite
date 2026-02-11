import { useState } from 'react';
import { useTrades } from '../hooks/useTrades';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Link } from 'react-router';
import { Search, ArrowUpDown } from 'lucide-react';

export function TradeHistory() {
  const { trades } = useTrades();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'symbol' | 'pl'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');

  // Filter and sort trades
  const filteredTrades = trades
    .filter((trade) => {
      const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || trade.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
      } else if (sortBy === 'symbol') {
        return a.symbol.localeCompare(b.symbol);
      } else {
        return (b.profitLoss || 0) - (a.profitLoss || 0);
      }
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trade History</h1>
        <p className="text-gray-500 mt-1">View and manage all your trades</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>All Trades ({filteredTrades.length})</CardTitle>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full md:w-[200px]"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const options: Array<'date' | 'symbol' | 'pl'> = ['date', 'symbol', 'pl'];
                  const currentIndex = options.indexOf(sortBy);
                  setSortBy(options[(currentIndex + 1) % options.length]);
                }}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort: {sortBy === 'date' ? 'Date' : sortBy === 'symbol' ? 'Symbol' : 'P&L'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTrades.length > 0 ? (
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
                      Quantity
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Entry
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Exit
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
                      P&L %
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                        {trade.quantity}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        ${trade.entryPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
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
                        {trade.profitLossPercent !== undefined ? (
                          <span
                            className={`font-medium ${
                              trade.profitLossPercent >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {trade.profitLossPercent >= 0 ? '+' : ''}
                            {trade.profitLossPercent.toFixed(2)}%
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
            <div className="text-center py-12 text-gray-500">
              <p>No trades found</p>
              {searchTerm && (
                <Button
                  variant="link"
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
