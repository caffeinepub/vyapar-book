import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Info, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAllProfits,
  useAllSales,
  useCreateProfitEntry,
  useCreateSale,
  useDeleteProfitEntry,
  useDeleteSale,
} from "../hooks/useQueries";
import {
  dateToTimestamp,
  formatDate,
  formatRupees,
  parseRupees,
  todayStr,
} from "../utils/formatters";

function AddSaleSheet({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState(todayStr());
  const [cashAmt, setCashAmt] = useState("");
  const [onlineAmt, setOnlineAmt] = useState("");
  const [notes, setNotes] = useState("");
  const createSale = useCreateSale();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createSale.mutateAsync({
        date: dateToTimestamp(date),
        cashAmount: parseRupees(cashAmt || "0"),
        onlineAmount: parseRupees(onlineAmt || "0"),
        notes,
      });
      toast.success("Sale added successfully");
      onClose();
    } catch {
      toast.error("Failed to add sale");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <Label htmlFor="sale-date">Date</Label>
        <Input
          id="sale-date"
          data-ocid="sale.input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="cash-sales">Cash Sales (₹)</Label>
        <Input
          id="cash-sales"
          type="number"
          placeholder="0.00"
          value={cashAmt}
          onChange={(e) => setCashAmt(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="online-sales">Online Sales (₹)</Label>
        <Input
          id="online-sales"
          type="number"
          placeholder="0.00"
          value={onlineAmt}
          onChange={(e) => setOnlineAmt(e.target.value)}
          className="mt-1"
        />
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-primary">
          <Info className="w-3 h-3" />
          <span>Online amount auto-credited to Bank account</span>
        </div>
      </div>
      <div>
        <Label htmlFor="sale-notes">Notes</Label>
        <Textarea
          id="sale-notes"
          data-ocid="sale.textarea"
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>
      <Button
        data-ocid="sale.submit_button"
        type="submit"
        className="w-full h-11 rounded-xl"
        disabled={createSale.isPending}
      >
        {createSale.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Add Sale
      </Button>
    </form>
  );
}

function AddProfitSheet({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState(todayStr());
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const createProfit = useCreateProfitEntry();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) {
      toast.error("Enter an amount");
      return;
    }
    try {
      await createProfit.mutateAsync({
        date: dateToTimestamp(date),
        amount: parseRupees(amount),
        notes,
      });
      toast.success("Profit entry added");
      onClose();
    } catch {
      toast.error("Failed to add profit entry");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div>
        <Label htmlFor="profit-date">Date</Label>
        <Input
          id="profit-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="profit-amount">Gross Profit Amount (₹)</Label>
        <Input
          id="profit-amount"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="profit-notes">Notes</Label>
        <Textarea
          id="profit-notes"
          placeholder="Optional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>
      <Button
        data-ocid="profit.submit_button"
        type="submit"
        className="w-full h-11 rounded-xl"
        disabled={createProfit.isPending}
      >
        {createProfit.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Add Profit Entry
      </Button>
    </form>
  );
}

export default function Sales() {
  const { data: sales = [], isLoading: salesLoading } = useAllSales();
  const { data: profits = [], isLoading: profitsLoading } = useAllProfits();
  const deleteSale = useDeleteSale();
  const deleteProfit = useDeleteProfitEntry();
  const [saleOpen, setSaleOpen] = useState(false);
  const [profitOpen, setProfitOpen] = useState(false);

  const sortedSales = [...sales].sort((a, b) => Number(b.date - a.date));
  const sortedProfits = [...profits].sort((a, b) => Number(b.date - a.date));

  async function handleDeleteSale(id: bigint) {
    try {
      await deleteSale.mutateAsync(id);
      toast.success("Sale deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleDeleteProfit(id: bigint) {
    try {
      await deleteProfit.mutateAsync(id);
      toast.success("Profit entry deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Sales Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Sales</h2>
        <Sheet open={saleOpen} onOpenChange={setSaleOpen}>
          <SheetTrigger asChild>
            <Button
              data-ocid="sale.open_modal_button"
              size="sm"
              className="h-9 rounded-full px-4 gap-1"
            >
              <Plus className="w-4 h-4" /> Add Sale
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
          >
            <SheetHeader className="mb-4">
              <SheetTitle>Add Sale</SheetTitle>
            </SheetHeader>
            <AddSaleSheet onClose={() => setSaleOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {salesLoading ? (
        <div data-ocid="sale.loading_state" className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : sortedSales.length === 0 ? (
        <div
          data-ocid="sale.empty_state"
          className="text-center py-8 text-muted-foreground text-sm bg-secondary rounded-xl"
        >
          No sales recorded yet.
        </div>
      ) : (
        <div className="space-y-2" data-ocid="sale.list">
          {sortedSales.map((sale, idx) => (
            <div
              key={sale.id.toString()}
              data-ocid={`sale.item.${idx + 1}`}
              className="bg-white border border-border rounded-xl p-3 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(sale.date)}
                    </span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Cash:{" "}
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatRupees(sale.cashAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Online:{" "}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {formatRupees(sale.onlineAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Total:{" "}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {formatRupees(sale.cashAmount + sale.onlineAmount)}
                      </span>
                    </div>
                  </div>
                  {sale.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {sale.notes}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  data-ocid={`sale.delete_button.${idx + 1}`}
                  onClick={() => handleDeleteSale(sale.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="border-border" />

      {/* Gross Profit Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">
          Gross Profit Entries
        </h2>
        <Sheet open={profitOpen} onOpenChange={setProfitOpen}>
          <SheetTrigger asChild>
            <Button
              data-ocid="profit.open_modal_button"
              size="sm"
              variant="outline"
              className="h-9 rounded-full px-4 gap-1"
            >
              <Plus className="w-4 h-4" /> Add Entry
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
          >
            <SheetHeader className="mb-4">
              <SheetTitle>Add Gross Profit Entry</SheetTitle>
            </SheetHeader>
            <AddProfitSheet onClose={() => setProfitOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {profitsLoading ? (
        <div data-ocid="profit.loading_state" className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : sortedProfits.length === 0 ? (
        <div
          data-ocid="profit.empty_state"
          className="text-center py-6 text-muted-foreground text-sm bg-secondary rounded-xl"
        >
          No gross profit entries yet.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedProfits.map((p, idx) => (
            <div
              key={p.id.toString()}
              data-ocid={`profit.item.${idx + 1}`}
              className="bg-white border border-border rounded-xl p-3 shadow-card flex items-center justify-between"
            >
              <div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(p.date)}
                </span>
                <p className="text-sm font-bold text-green-600">
                  {formatRupees(p.amount)}
                </p>
                {p.notes && (
                  <p className="text-xs text-muted-foreground">{p.notes}</p>
                )}
              </div>
              <button
                type="button"
                data-ocid={`profit.delete_button.${idx + 1}`}
                onClick={() => handleDeleteProfit(p.id)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
