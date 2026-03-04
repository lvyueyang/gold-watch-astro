import { useQuery } from "@tanstack/react-query";
import { Calculator, X } from "lucide-react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useInstrumentPrice } from "@/hooks/usePrice";

const CalculatorHeader = () => (
  <>
    <div className="flex items-center gap-2 text-xl font-semibold leading-none tracking-tight">
      <div className="p-1.5 bg-primary/10 rounded-full text-primary">
        <Calculator className="h-5 w-5" />
      </div>
      金价预期计算器
    </div>
    <div className="text-xs text-muted-foreground mt-1">
      输入成本、克数与费率，快速计算回本与预期目标。
    </div>
  </>
);

const CalculatorForm: React.FC<{
  instruments: { id: string; name: string }[];
  selectedInstrument: string;
  setSelectedInstrument: (v: string) => void;
  costPrice: string;
  setCostPrice: (v: string) => void;
  grams: string;
  setGrams: (v: string) => void;
  currentPrice: string;
  setCurrentPrice: (v: string) => void;
  feeRate: string;
  setFeeRate: (v: string) => void;
  expectedProfit: string;
  setExpectedProfit: (v: string) => void;
  breakEvenPrice: number | null;
  feeAmount: number | null;
  currentProfit: number | null;
  goldProfit: number | null;
  totalFeeAmount: number | null;
  targetPrice: number | null;
}> = ({
  instruments,
  selectedInstrument,
  setSelectedInstrument,
  costPrice,
  setCostPrice,
  grams,
  setGrams,
  currentPrice,
  setCurrentPrice,
  feeRate,
  setFeeRate,
  expectedProfit,
  setExpectedProfit,
  breakEvenPrice,
  feeAmount,
  currentProfit,
  goldProfit,
  totalFeeAmount,
  targetPrice,
}) => {
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
    <div className="flex-1 overflow-y-auto p-4 pt-2 gap-4 flex flex-col">
      {/* Instrument Selection */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="instrument" className="text-xs text-muted-foreground">
            选择参考标的 (可选)
          </Label>
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
          <SelectTrigger className="h-9 text-base md:text-sm">
            <SelectValue placeholder="选择标的以自动更新当前金价" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(instruments) &&
              instruments.map((inst) => (
                <SelectItem key={inst.id} value={inst.id} className="text-base md:text-sm">
                  {inst.name} ({inst.id})
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="costPrice" className="text-xs text-muted-foreground">
            成本均价 (元/克)
          </Label>
          <Input
            id="costPrice"
            type="number"
            placeholder="0.00"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            className="text-right h-9 text-base md:text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="grams" className="text-xs text-muted-foreground">
            持有克数 (g)
          </Label>
          <Input
            id="grams"
            type="number"
            placeholder="0"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="text-right h-9 text-base md:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="currentPrice" className="text-xs text-muted-foreground">
            当前金价 (元/克)
          </Label>
          <Input
            id="currentPrice"
            type="number"
            placeholder="0.00"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            className="text-right h-9 text-base md:text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="feeRate" className="text-xs text-muted-foreground">
            卖出费率 (%)
          </Label>
          <Input
            id="feeRate"
            type="number"
            placeholder="0"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            className="text-right h-9 text-base md:text-sm"
          />
        </div>
      </div>

      {/* Results Card */}
      <Card className="bg-secondary/30 border-primary/10 shadow-sm shrink-0">
        <CardContent className="p-3 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">回本金价</span>
              {breakEvenPrice !== null && (
                <span className="text-[10px] text-muted-foreground/70 scale-90 origin-left">
                  (含 {feeRate}% 费率{feeAmount !== null && ` ≈ ¥${feeAmount.toFixed(2)}`})
                </span>
              )}
            </div>
            <span className="text-base font-bold text-foreground font-mono">
              {formatCurrency(breakEvenPrice)}
            </span>
          </div>

          <Separator className="bg-primary/5" />

          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">当前浮动盈亏</span>
              {goldProfit !== null && totalFeeAmount !== null && (
                <div className="flex flex-col text-[10px] text-muted-foreground/70 scale-90 origin-left">
                  <span>金价盈亏: {formatProfit(goldProfit)}</span>
                  <span>卖出费率: -{formatCurrency(totalFeeAmount).replace("¥", "")}</span>
                </div>
              )}
            </div>
            <span
              className={`text-lg font-bold font-mono ${currentProfit !== null ? (currentProfit >= 0 ? "text-green-500" : "text-red-500") : "text-foreground"}`}
            >
              {formatProfit(currentProfit)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Expectation Input */}
      <div className="space-y-2 pb-2">
        <Label htmlFor="expectedProfit" className="text-sm font-medium">
          预期收益金额 (元)
        </Label>
        <div className="flex gap-3 items-stretch h-10">
          <div className="relative flex-1 h-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              ¥
            </span>
            <Input
              id="expectedProfit"
              type="number"
              placeholder="输入金额"
              value={expectedProfit}
              onChange={(e) => setExpectedProfit(e.target.value)}
              className="pl-7 h-full text-base md:text-sm"
            />
          </div>
          <div className="flex-1 px-2 bg-primary/10 rounded-md border border-primary/20 flex flex-col justify-center items-center h-full">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider scale-90">
              目标卖出价
            </div>
            <div className="text-sm font-bold text-primary font-mono leading-none mt-0.5">
              {formatCurrency(targetPrice)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DraggableWindow: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  // Reset position when opened? Or keep it?
  // Let's keep it persistent for session if desired, but for now reset on mount isn't happening.
  // We want to center it initially or put it somewhere visible.
  // Using fixed positioning: right: 2rem, bottom: 6rem initially.
  // But dragging uses transform translate.

  // To simplify: we use fixed positioning with `top` and `left`.
  // Initial: center of screen or bottom right.
  // Let's set initial position to bottom-right area.

  useEffect(() => {
    // Set initial position if needed, or rely on CSS default
    // We'll use style={{ transform: `translate(${x}px, ${y}px)` }}
    // Initial position is handled by CSS (e.g., bottom-20 right-20), and translate adds to it.
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { ...position };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    setPosition({
      x: initialPos.current.x + dx,
      y: initialPos.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-24 right-8 z-50 w-[400px] bg-card rounded-lg border border-primary/20 shadow-xl flex flex-col max-h-[85vh] overflow-hidden"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Header Handle */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Drag handle */}
      <div
        className="p-4 pb-2 cursor-move bg-muted/30 select-none flex justify-between items-start"
        onMouseDown={handleMouseDown}
      >
        <div>
          <CalculatorHeader />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

const GoldCalculator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
  let _totalHold: number | null = null;
  let goldProfit: number | null = null;
  let totalFeeAmount: number | null = null;

  if (!Number.isNaN(cp) && !Number.isNaN(fr) && fr < 1) {
    breakEvenPrice = cp / (1 - fr);

    if (!Number.isNaN(g) && g > 0) {
      feeAmount = breakEvenPrice * g * fr;

      if (!Number.isNaN(curP)) {
        const netIncome = curP * g * (1 - fr);
        const totalCost = cp * g;
        currentProfit = netIncome - totalCost;
        _totalHold = netIncome;
        goldProfit = (curP - cp) * g;
        totalFeeAmount = curP * g * fr;
      }

      if (!Number.isNaN(expP)) {
        const totalCost = cp * g;
        targetPrice = (expP + totalCost) / (g * (1 - fr));
      }
    }
  }

  const formProps = {
    instruments,
    selectedInstrument,
    setSelectedInstrument,
    costPrice,
    setCostPrice,
    grams,
    setGrams,
    currentPrice,
    setCurrentPrice,
    feeRate,
    setFeeRate,
    expectedProfit,
    setExpectedProfit,
    breakEvenPrice,
    feeAmount,
    currentProfit,
    goldProfit,
    totalFeeAmount,
    targetPrice,
  };

  // Render Trigger Button
  const TriggerButton = (
    <Button
      className="fixed bottom-24 right-4 md:bottom-8 md:right-8 rounded-full h-12 w-12 shadow-lg z-40 bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105"
      onClick={() => setIsOpen(true)}
    >
      <Calculator className="h-6 w-6" />
    </Button>
  );

  if (isDesktop) {
    return (
      <>
        {!isOpen && TriggerButton}
        <DraggableWindow isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <CalculatorForm {...formProps} />
        </DraggableWindow>
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{TriggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px] w-[95%] rounded-lg border-primary/20 shadow-xl bg-card max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>
            <div className="flex items-center gap-2 text-xl font-semibold leading-none tracking-tight">
              <div className="p-1.5 bg-primary/10 rounded-full text-primary">
                <Calculator className="h-5 w-5" />
              </div>
              金价预期计算器
            </div>
          </DialogTitle>
          <DialogDescription className="text-xs mt-1">
            输入成本、克数与费率，快速计算回本与预期目标。
          </DialogDescription>
        </DialogHeader>

        <CalculatorForm {...formProps} />
      </DialogContent>
    </Dialog>
  );
};

export default GoldCalculator;
