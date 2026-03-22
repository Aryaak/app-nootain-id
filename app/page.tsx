"use client";

import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useProducts } from "@/hooks/useProducts";
import { useTransactions } from "@/hooks/useTransactions";
import RevenueChart from "@/components/RevenueChart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  format, 
  subDays, 
  startOfDay, 
  isWithinInterval, 
  endOfDay, 
  eachDayOfInterval,
  startOfMonth
} from "date-fns";
import { id } from "date-fns/locale";

export default function Home() {
  const { products, loading: loadingProducts } = useProducts();
  const { transactions, loading: loadingTransactions } = useTransactions();

  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfDay(new Date()));

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const tDate = new Date(t.timestamp);
      return isWithinInterval(tDate, { 
        start: startOfDay(startDate), 
        end: endOfDay(endDate) 
      });
    });
  }, [transactions, startDate, endDate]);

  const formatNumberAbbreviated = (value: number, isCurrency = true) => {
    let formatted = "";
    if (value >= 1e12) formatted = (value / 1e12).toFixed(2).replace(/\.00$/, "") + " T";
    else if (value >= 1e9) formatted = (value / 1e9).toFixed(2).replace(/\.00$/, "") + " M";
    else if (value >= 1e6) formatted = (value / 1e6).toFixed(2).replace(/\.00$/, "") + " Jt";
    else if (value >= 1e3) formatted = (value / 1e3).toFixed(2).replace(/\.00$/, "") + " Rb";
    else formatted = value.toString();

    return isCurrency ? `Rp ${formatted}` : formatted;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);

    if (diffInMins < 1) return "Baru saja";
    if (diffInMins < 60) return `${diffInMins} menit lalu`;
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    return past.toLocaleDateString("id-ID");
  };

  const statsData = useMemo(() => {
    // Only calculate omset and bersil for settled transactions (status !== "Hutang")
    const settledTransactions = filteredTransactions.filter(t => t.status !== "Hutang");

    // Omset = Total Pendapatan Kotor (Selling Price Total)
    const omset = settledTransactions.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
    // Modal = Total Modal items yang terjual (Cost Price Total)
    const modal = settledTransactions.reduce((acc, t) => acc + (Number(t.totalModal) || 0), 0);
    // Bersih = Keuntungan (Omset - Modal)
    const bersih = omset - modal;
    
    return [
      { name: "Total Omset", value: formatNumberAbbreviated(omset), trend: "+100%", icon: "fa-solid fa-wallet" },
      { name: "Total Bersih", value: formatNumberAbbreviated(bersih), trend: bersih >= 0 ? "+100%" : "0%", icon: "fa-solid fa-money-bill-trend-up" },
      { name: "Total Produk", value: formatNumberAbbreviated(products.length, false), trend: `+${products.length}`, icon: "fa-solid fa-box" },
      { name: "Total Penjualan", value: formatNumberAbbreviated(filteredTransactions.length, false), trend: `+${filteredTransactions.length}`, icon: "fa-solid fa-cart-shopping" },
    ];
  }, [filteredTransactions, products, formatNumberAbbreviated]);

  const topProducts = useMemo(() => {
    const productMap: Record<number, { name: string, sales: number }> = {};
    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        if (!productMap[item.id]) {
          productMap[item.id] = { name: item.nama, sales: 0 };
        }
        productMap[item.id].sales += item.quantity;
      });
    });

    return Object.entries(productMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [filteredTransactions]);

  const recentSales = useMemo(() => {
    return filteredTransactions.slice(0, 5).map(t => ({
      id: `#${t.id}`,
      time: getTimeAgo(t.timestamp),
      amount: `Rp ${t.total.toLocaleString("id-ID")}`
    }));
  }, [filteredTransactions]);

  const chartData = useMemo(() => {
    const interval = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return interval.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      const dayTransactions = filteredTransactions.filter((t) => {
        const tDate = new Date(t.timestamp);
        return t.status !== "Hutang" && isWithinInterval(tDate, { start: dayStart, end: dayEnd });
      });

      const omset = dayTransactions.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
      const modal = dayTransactions.reduce((acc, t) => acc + (Number(t.totalModal) || 0), 0);
      const bersih = omset - modal;

      return {
        date: format(day, "dd MMM", { locale: id }),
        omset,
        bersih,
      };
    });
  }, [filteredTransactions, startDate, endDate]);

  if (loadingProducts || loadingTransactions) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-400">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-primary"></i>
          <p className="font-bold">Memuat Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-5">
         <div className="mb-6  grid grid-cols-2 bg-white rounded-xl md:rounded-2xl border border-zinc-200 shadow-sm transition-all hover:border-primary/20 overflow-hidden divide-x divide-zinc-100">
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50/50">
          <i className="fa-solid fa-calendar-alt text-primary text-xs md:text-sm"></i>
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 hidden sm:inline">Dari:</span>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => date && setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="dd MMM yyyy"
            locale="id"
            className="w-full bg-transparent border-none text-xs md:text-sm font-bold text-zinc-700 focus:ring-0 cursor-pointer p-0"
            popperPlacement="bottom-start"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50/50">
          <i className="fa-solid fa-calendar-alt text-primary text-xs md:text-sm"></i>
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 hidden sm:inline">Sampai:</span>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => date && setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="dd MMM yyyy"
            locale="id"
            className="w-full bg-transparent border-none text-xs md:text-sm font-bold text-zinc-700 focus:ring-0 cursor-pointer p-0"
            popperPlacement="bottom-end"
          />
        </div>
      </div>

      <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
        <RevenueChart data={chartData} />
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {statsData.map((stat) => (
          <div
            key={stat.name}
            className="p-4 md:p-6 bg-white border-l-4 border-l-primary border-y border-r border-zinc-200 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 md:mb-4">
              <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm md:text-xl">
                <i className={stat.icon}></i>
              </span>
              <span className="w-fit text-[10px] md:text-xs font-semibold px-2 py-0.5 md:py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-xs md:text-sm font-medium text-zinc-500 mb-0.5 md:mb-1 truncate">{stat.name}</h3>
            <p className="text-sm sm:text-lg md:text-2xl font-bold text-zinc-900 truncate">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 md:mt-8 grid gap-4 md:gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="p-5 md:p-8 bg-white border-l-4 border-l-primary border-y border-r border-zinc-200 rounded-2xl md:rounded-3xl relative overflow-hidden shadow-sm">
          <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-zinc-800 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-primary text-sm"></i>
            Daftar Penjualan Terbaru
          </h2>
          <div className="space-y-4 md:space-y-6">
            {recentSales.length === 0 ? (
              <div className="py-10 text-center text-zinc-400 italic text-sm">Belum ada transaksi</div>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center gap-3 md:gap-4 hover:bg-zinc-50 p-2 -m-2 rounded-xl transition-colors mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm md:text-base shrink-0">
                    <i className="fa-solid fa-receipt text-primary/40"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm md:text-base text-zinc-900 truncate">Transaksi {sale.id}</p>
                    <p className="text-[10px] md:text-xs text-zinc-500 truncate">{sale.time}</p>
                  </div>
                  <div className="ml-auto text-xs md:text-sm font-bold text-primary whitespace-nowrap">
                    {sale.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-5 md:p-8 bg-white border-l-4 border-l-primary border-y border-r border-zinc-200 rounded-2xl md:rounded-3xl relative overflow-hidden shadow-sm">
          <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6 text-zinc-800 flex items-center gap-2">
            <i className="fa-solid fa-crown text-primary text-sm"></i>
            5 Produk Terlaris
          </h2>
          <div className="space-y-4 md:space-y-6">
            {topProducts.length === 0 ? (
              <div className="py-10 text-center text-zinc-400 italic text-sm">Belum data penjualan produk</div>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3 md:gap-4 hover:bg-zinc-50 p-2 -m-2 rounded-xl transition-colors">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm md:text-base shrink-0">
                    #{index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm md:text-base text-zinc-900 truncate uppercase tracking-tight">{product.name}</p>
                  </div>
                  <div className="ml-auto text-xs md:text-sm text-zinc-500 whitespace-nowrap font-medium">
                    <span className="text-primary font-bold">{product.sales}</span> terjual
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
     </div>
    </DashboardLayout>
  );
}
