import { Calculator, X } from "lucide-react";
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useInstrumentPrice } from "@/hooks/usePrice";
import { useQuery } from "@tanstack/react-query";

const GoldCalculator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Inputs
  const [costPrice, setCostPrice] = useState<string>("");
  const [grams, setGrams] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<string>("");
  const [feeRate, setFeeRate] = useState<string>("0"); // 0% by default
  const [expectedProfit, setExpectedProfit] = useState<string>("");
  const [selectedInstrument, setSelectedInstrument] = useState<string>("");

  // Load from localStorage on mount
  useEffect(() => {
    const savedCost = localStorage.getItem("calc_costPrice");
    const savedGrams = localStorage.getItem("calc_grams");
    const savedFee = localStorage.getItem("calc_feeRate");
    const savedInstrument = localStorage.getItem("calc_instrument");
    const savedExpectedProfit = localStorage.getItem("calc_expectedProfit");

    if (savedCost) setCostPrice(savedCost);
    if (savedGrams) setGrams(savedGrams);
    if (savedFee) setFeeRate(savedFee);
    if (savedInstrument) setSelectedInstrument(savedInstrument);
    if (savedExpectedProfit) setExpectedProfit(savedExpectedProfit);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("calc_costPrice", costPrice);
    localStorage.setItem("calc_grams", grams);
    localStorage.setItem("calc_feeRate", feeRate);
    localStorage.setItem("calc_instrument", selectedInstrument);
    localStorage.setItem("calc_expectedProfit", expectedProfit);
  }, [costPrice, grams, feeRate, selectedInstrument, expectedProfit]);

  // Fetch instruments
  const { data: instruments = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["instruments"],
    queryFn: async () => {
      const res = await fetch("/api/instruments");
      return await res.json();
    },
  });

  // Fetch price for selected instrument
  const { data: priceData } = useInstrumentPrice(selectedInstrument || undefined);

  // Update current price when instrument price changes
  useEffect(() => {
    if (priceData) {
      setCurrentPrice(priceData.price.toString());
    }
  }, [priceData]);

  // Derived calculations
  const cp = Number.parseFloat(costPrice);
  const g = Number.parseFloat(grams);
  const fr = Number.parseFloat(feeRate) / 100; // input is percentage
  const curP = Number.parseFloat(currentPrice);
  const expP = Number.parseFloat(expectedProfit);

  let breakEvenPrice: number | null = null;
  let targetPrice: number | null = null;
  let currentProfit: number | null = null;
  let feeAmount: number | null = null;
  let totalHold: number | null = null;
  let goldProfit: number | null = null;
  let totalFeeAmount: number | null = null;

  if (!isNaN(cp) && !isNaN(fr) && fr < 1) {
    // Break-even Price = Cost Price / (1 - Fee Rate)
    breakEvenPrice = cp / (1 - fr);

    if (!isNaN(g) && g > 0) {
      // Fee Amount at Break-even Price
      feeAmount = breakEvenPrice * g * fr;

      // Current Profit
      if (!isNaN(curP)) {
        // Net Income = Current Price * Grams * (1 - Fee Rate)
        // Profit = Net Income - (Cost Price * Grams)
        const netIncome = curP * g * (1 - fr);
        const totalCost = cp * g;
        currentProfit = netIncome - totalCost;
        totalHold = netIncome;
        
        // Breakdown: Gold Profit + Fee Amount
        // Gold Profit = (Current Price - Cost Price) * Grams
        goldProfit = (curP - cp) * g;
        // Total Fee Amount = Current Price * Grams * Fee Rate
        totalFeeAmount = curP * g * fr;
      }

      // Target Price
      if (!isNaN(expP)) {
        // Target Price = (Expected Profit + Total Cost) / (Grams * (1 - Fee Rate))
        const totalCost = cp * g;
        targetPrice = (expP + totalCost) / (g * (1 - fr));
      }
    }
  }

  const formatCurrency = (val: number | null) => {
    if (val === null) return "-";
    return `¥${val.toFixed(2)}`;
  };

  const formatProfit = (val: number | null) => {
      if (val === null) return "-";
      const prefix = val > 0 ? "+" : "";
      return `${prefix}${val.toFixed(2)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 rounded-full h-12 w-12 shadow-lg z-40 bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105"
        >
          <Calculator className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] w-[95%] rounded-lg border-primary/20 shadow-xl bg-card">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-1.5 bg-primary/10 rounded-full text-primary">
                <Calculator className="h-5 w-5" />
            </div>
            金价预期计算器
          </DialogTitle>
          <DialogDescription>
            输入成本、克数与费率，快速计算回本与预期目标。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Instrument Selection */}
          <div className="space-y-2">
             <div className="flex justify-between items-center">
               <Label htmlFor="instrument" className="text-xs text-muted-foreground">选择参考标的 (可选)</Label>
               {selectedInstrument && (
                 <button 
                    type="button"
                    onClick={() => setSelectedInstrument("")}
                    className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1"
                  >
                   <X className="h-3 w-3" /> 清除
                 </button>
               )}
             </div>
             <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
               <SelectTrigger className="h-9">
                  <SelectValue placeholder="选择标的以自动更新当前金价" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(instruments) && instruments.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name} ({inst.id})
                    </SelectItem>
                  ))}
                </SelectContent>
             </Select>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice" className="text-xs text-muted-foreground">成本均价 (元/克)</Label>
              <Input
                id="costPrice"
                type="number"
                placeholder="0.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="text-right h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grams" className="text-xs text-muted-foreground">持有克数 (g)</Label>
              <Input
                id="grams"
                type="number"
                placeholder="0"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                className="text-right h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPrice" className="text-xs text-muted-foreground">当前金价 (元/克)</Label>
              <Input
                id="currentPrice"
                type="number"
                placeholder="0.00"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="text-right h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeRate" className="text-xs text-muted-foreground">卖出费率 (%)</Label>
              <Input
                id="feeRate"
                type="number"
                placeholder="0"
                value={feeRate}
                onChange={(e) => setFeeRate(e.target.value)}
                className="text-right h-9"
              />
            </div>
          </div>

          <Separator className="my-2" />

          {/* Results Card */}
          <Card className="bg-secondary/30 border-primary/10 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">回本金价</span>
                  {breakEvenPrice !== null && (
                    <span className="text-[10px] text-muted-foreground/70">
                      (含 {feeRate}% 费率{feeAmount !== null && ` ≈ ¥${feeAmount.toFixed(2)}`})
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-foreground font-mono">{formatCurrency(breakEvenPrice)}</span>
              </div>
              
              <div className="flex justify-between items-start">
                 <div className="flex flex-col">
                   <span className="text-sm font-medium text-muted-foreground">当前浮动盈亏</span>
                   {goldProfit !== null && totalFeeAmount !== null && (
                     <div className="flex flex-col text-[10px] text-muted-foreground/70">
                       <span>金价盈亏: {formatProfit(goldProfit)}</span>
                       <span>卖出费率: -{formatCurrency(totalFeeAmount).replace('¥', '')}</span>
                     </div>
                   )}
                 </div>
                 <span className={`text-lg font-bold font-mono ${currentProfit !== null ? (currentProfit >= 0 ? "text-green-500" : "text-red-500") : "text-foreground"}`}>
                   {formatProfit(currentProfit)}
                 </span>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-2" />

          {/* Expectation Input */}
          <div className="space-y-2">
            <Label htmlFor="expectedProfit" className="text-sm font-medium">预期收益金额 (元)</Label>
            <div className="flex gap-3 items-stretch">
              <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">¥</span>
                  <Input
                    id="expectedProfit"
                    type="number"
                    placeholder="输入金额"
                    value={expectedProfit}
                    onChange={(e) => setExpectedProfit(e.target.value)}
                    className="pl-7 h-full"
                  />
              </div>
              <div className="flex-1 p-2 bg-primary/10 rounded-md border border-primary/20 flex flex-col justify-center items-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">目标卖出价</div>
                <div className="text-base font-bold text-primary font-mono">{formatCurrency(targetPrice)}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoldCalculator;
