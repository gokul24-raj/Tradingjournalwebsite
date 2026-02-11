import { useState } from 'react';
import { useTrades } from '../hooks/useTrades';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export function AddTrade() {
  const { addTrade } = useTrades();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    symbol: '',
    type: 'long' as 'long' | 'short',
    quantity: '',
    entryPrice: '',
    exitPrice: '',
    entryDate: new Date().toISOString().split('T')[0],
    exitDate: '',
    notes: '',
    strategy: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.symbol || !formData.quantity || !formData.entryPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = formData.exitPrice ? parseFloat(formData.exitPrice) : undefined;

    if (isNaN(quantity) || isNaN(entryPrice) || (exitPrice !== undefined && isNaN(exitPrice))) {
      toast.error('Please enter valid numbers for quantity and prices');
      return;
    }

    const status = formData.exitPrice && formData.exitDate ? 'closed' : 'open';
    let profitLoss: number | undefined;
    let profitLossPercent: number | undefined;

    if (status === 'closed' && exitPrice !== undefined) {
      profitLoss =
        formData.type === 'long'
          ? (exitPrice - entryPrice) * quantity
          : (entryPrice - exitPrice) * quantity;
      profitLossPercent =
        formData.type === 'long'
          ? ((exitPrice - entryPrice) / entryPrice) * 100
          : ((entryPrice - exitPrice) / entryPrice) * 100;
    }

    addTrade({
      symbol: formData.symbol.toUpperCase(),
      type: formData.type,
      quantity,
      entryPrice,
      exitPrice,
      entryDate: formData.entryDate,
      exitDate: formData.exitDate || undefined,
      profitLoss,
      profitLossPercent,
      notes: formData.notes || undefined,
      strategy: formData.strategy || undefined,
      status,
    });

    toast.success('Trade added successfully');
    navigate('/');
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Trade</h1>
        <p className="text-gray-500 mt-1">Record a new trade in your journal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="symbol">Symbol *</Label>
                <Input
                  id="symbol"
                  placeholder="e.g., AAPL"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData({ ...formData, symbol: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'long' | 'short',
                    })
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  placeholder="e.g., 100"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="strategy">Strategy</Label>
                <Input
                  id="strategy"
                  placeholder="e.g., Swing Trading"
                  value={formData.strategy}
                  onChange={(e) =>
                    setFormData({ ...formData, strategy: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="entryPrice">Entry Price *</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 150.50"
                  value={formData.entryPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, entryPrice: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="entryDate">Entry Date *</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, entryDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="exitPrice">Exit Price (optional)</Label>
                <Input
                  id="exitPrice"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 158.25"
                  value={formData.exitPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, exitPrice: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="exitDate">Exit Date (optional)</Label>
                <Input
                  id="exitDate"
                  type="date"
                  value={formData.exitDate}
                  onChange={(e) =>
                    setFormData({ ...formData, exitDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this trade..."
                rows={4}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit">Add Trade</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
