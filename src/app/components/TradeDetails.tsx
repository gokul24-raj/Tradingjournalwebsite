import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTrades } from '../hooks/useTrades';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

export function TradeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trades, deleteTrade, closeTrade } = useTrades();
  const trade = trades.find((t) => t.id === id);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [closeData, setCloseData] = useState({
    exitPrice: '',
    exitDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  if (!trade) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Trade not found</h2>
        <Button onClick={() => navigate('/')} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteTrade(trade.id);
    toast.success('Trade deleted successfully');
    navigate('/history');
  };

  const handleCloseTrade = () => {
    const exitPrice = parseFloat(closeData.exitPrice);
    if (isNaN(exitPrice)) {
      toast.error('Please enter a valid exit price');
      return;
    }

    closeTrade(trade.id, exitPrice, closeData.exitDate, closeData.notes);
    toast.success('Trade closed successfully');
    setShowCloseDialog(false);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{trade.symbol}</h1>
            <p className="text-gray-500 mt-1">Trade Details</p>
          </div>
          <div className="flex gap-2">
            {trade.status === 'open' && (
              <Button onClick={() => setShowCloseDialog(true)}>
                Close Trade
              </Button>
            )}
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trade Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Symbol</div>
              <div className="text-lg font-medium text-gray-900">{trade.symbol}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Type</div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                  trade.type === 'long'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {trade.type.toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm text-gray-600">Quantity</div>
              <div className="text-lg font-medium text-gray-900">{trade.quantity}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                  trade.status === 'open'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {trade.status.toUpperCase()}
              </span>
            </div>
            {trade.strategy && (
              <div>
                <div className="text-sm text-gray-600">Strategy</div>
                <div className="text-lg font-medium text-gray-900">{trade.strategy}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price & Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Entry Price</div>
              <div className="text-lg font-medium text-gray-900">
                ${trade.entryPrice.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Entry Date</div>
              <div className="text-lg font-medium text-gray-900">{trade.entryDate}</div>
            </div>
            {trade.exitPrice && (
              <>
                <div>
                  <div className="text-sm text-gray-600">Exit Price</div>
                  <div className="text-lg font-medium text-gray-900">
                    ${trade.exitPrice.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Exit Date</div>
                  <div className="text-lg font-medium text-gray-900">
                    {trade.exitDate}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {trade.profitLoss !== undefined && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-sm text-gray-600">Profit / Loss</div>
                  <div
                    className={`text-3xl font-bold ${
                      trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ${trade.profitLoss.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">P&L Percentage</div>
                  <div
                    className={`text-3xl font-bold ${
                      (trade.profitLossPercent || 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {(trade.profitLossPercent || 0) >= 0 ? '+' : ''}
                    {(trade.profitLossPercent || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {trade.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{trade.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Close Trade Dialog */}
      {showCloseDialog && (
        <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close Trade</AlertDialogTitle>
              <AlertDialogDescription>
                Enter the exit details for this trade.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="exitPrice">Exit Price *</Label>
                <Input
                  id="exitPrice"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 158.25"
                  value={closeData.exitPrice}
                  onChange={(e) =>
                    setCloseData({ ...closeData, exitPrice: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="exitDate">Exit Date *</Label>
                <Input
                  id="exitDate"
                  type="date"
                  value={closeData.exitDate}
                  onChange={(e) =>
                    setCloseData({ ...closeData, exitDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="closeNotes">Notes (optional)</Label>
                <Input
                  id="closeNotes"
                  placeholder="Add closing notes..."
                  value={closeData.notes}
                  onChange={(e) =>
                    setCloseData({ ...closeData, notes: e.target.value })
                  }
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCloseTrade}>
                Close Trade
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this trade
              from your journal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
