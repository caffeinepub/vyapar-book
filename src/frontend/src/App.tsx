import { Toaster } from "@/components/ui/sonner";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Receipt,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "./hooks/useActor";
import Analytics from "./pages/Analytics";
import CashBook from "./pages/CashBook";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Sales from "./pages/Sales";
import SettingsPage from "./pages/Settings";

type Tab =
  | "dashboard"
  | "sales"
  | "expenses"
  | "cashbook"
  | "analytics"
  | "settings";

const NAV_ITEMS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "sales", label: "Sales", icon: ShoppingCart },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "cashbook", label: "Cash Book", icon: BookOpen },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { actor, isFetching } = useActor();

  useEffect(() => {
    if (actor && !isFetching) {
      actor.initialize().catch(() => {});
    }
  }, [actor, isFetching]);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-lg font-bold tracking-tight">BizBook</h1>
          <p className="text-xs opacity-70">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">B</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "dashboard" && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === "sales" && <Sales />}
        {activeTab === "expenses" && <Expenses />}
        {activeTab === "cashbook" && <CashBook />}
        {activeTab === "analytics" && <Analytics />}
        {activeTab === "settings" && <SettingsPage />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-border z-40">
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span
                  className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <Toaster position="top-center" />
    </div>
  );
}
