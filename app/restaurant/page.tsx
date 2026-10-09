'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  Utensils,
  Pizza,
  Coffee,
  Cake,
  Sandwich,
  Search,
  Plus,
  Minus,
  Check,
  Clock,
  Star,
  ShoppingBag,
  MessageCircle,
  X,
  Bot,
  Zap,
  ArrowRight,
  ShieldCheck,
  Heart,
  RotateCcw,
  QrCode,
  Calendar,
  Gift,
  ChefHat,
  ChevronRight,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import menuData from '@/data/restaurant-menu.json';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  isVeg: boolean;
  image: string;
}

export default function RestaurantMenuPage() {
  // Customer Profile State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('Table 4');
  const [customerBirthday, setCustomerBirthday] = useState('');
  const [isOnboardingDone, setIsOnboardingDone] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showBirthdayPassModal, setShowBirthdayPassModal] = useState(false);

  // Quick 1-tap name suggestions for zero-friction mobile onboarding
  const quickNames = ['Mukul', 'Aman', 'Rohan', 'Pooja', 'Priya', 'Vikram'];

  // Menu Filters & Search
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [specialNote, setSpecialNote] = useState('');

  // AI Upsell & Concierge State
  const [activeUpsell, setActiveUpsell] = useState<any | null>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiSpeech, setAiSpeech] = useState(
    'Namaste! Welcome to The Grand Bistro. Main aapki 3D AI Concierge Chef Maya hu. Table 4 ke liye best pairing recommend karu?'
  );

  // Order Placement State
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);

  // Live IST Time Calculation
  const [currentIST, setCurrentIST] = useState('');
  const [mealSlot, setMealSlot] = useState('Lunch Hours (Kitchen Active)');

  // Load saved guest profile on client mount
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('msr_restaurant_guest_name');
      const savedPhone = localStorage.getItem('msr_restaurant_guest_phone');
      const savedBday = localStorage.getItem('msr_restaurant_guest_bday');

      if (savedName) {
        setCustomerName(savedName);
        setIsOnboardingDone(true);
        setShowWelcomeModal(false);
        setAiSpeech(`Namaste ${savedName} ji! 🙏 Table 4 par aapka welcome hai. Aaj chef recommended sourdough pizzas aur artisanal sangria try karein!`);
      }
      if (savedPhone) setCustomerPhone(savedPhone);
      if (savedBday) setCustomerBirthday(savedBday);
    } catch {}
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istString = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
      });
      const hours = now.getHours();
      let slot = 'Lunch Hours (Kitchen Active)';
      if (hours >= 19 || hours < 24) {
        slot = 'Dinner Hours (Rooftop & Patio Open)';
      } else if (hours < 12) {
        slot = 'Breakfast & Artisanal Coffee Slot';
      }
      setCurrentIST(istString);
      setMealSlot(slot);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Menu Items
  const filteredItems = useMemo(() => {
    return menuData.items.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = !vegOnly || item.isVeg;
      return matchesCategory && matchesSearch && matchesVeg;
    });
  }, [activeCategory, searchQuery, vegOnly]);

  // Cart Totals
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const cartTotalQty = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const gstAmount = Math.round(cartSubtotal * 0.05);
  const grandTotal = cartSubtotal + gstAmount;

  // Add Item to Cart with AI Upselling trigger
  const handleAddToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          isVeg: item.isVeg,
          image: item.image,
        },
      ];
    });

    // Check if item has an AI upsell pairing
    if (item.upsellPairing) {
      setActiveUpsell({
        parentItem: item,
        ...item.upsellPairing,
      });
      setAiSpeech(
        `${customerName ? customerName + ' ji, ' : ''}${item.upsellPairing.pitch}`
      );
    } else {
      setAiSpeech(`Great choice! ${item.name} cart me add ho gaya hai.`);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.qty > 1) {
        return prev.map((i) => (i.id === itemId ? { ...i, qty: i.qty - 1 } : i));
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  // 1-Click Accept AI Upsell Combo
  const handleAcceptUpsell = () => {
    if (!activeUpsell) return;
    const addon = menuData.items.find((it) => it.id === activeUpsell.addonItemId);
    if (addon) {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === addon.id);
        if (existing) {
          return prev.map((i) => (i.id === addon.id ? { ...i, qty: i.qty + 1 } : i));
        }
        return [
          ...prev,
          {
            id: addon.id,
            name: `${addon.name} (Combo Offer)`,
            price: activeUpsell.discountedPrice || addon.price,
            qty: 1,
            isVeg: addon.isVeg,
            image: addon.image,
          },
        ];
      });
    }
    setActiveUpsell(null);
    setAiSpeech(`🎉 Awesome! Combo offer successfully added with ₹50 discount!`);
  };

  // Submit Customer Onboarding (Frictionless)
  const handleSaveGuestProfile = (nameToSave?: string) => {
    const finalName = (nameToSave || customerName || 'Valued Guest').trim();
    setCustomerName(finalName);
    setIsOnboardingDone(true);
    setShowWelcomeModal(false);

    try {
      localStorage.setItem('msr_restaurant_guest_name', finalName);
      if (customerPhone) localStorage.setItem('msr_restaurant_guest_phone', customerPhone);
      if (customerBirthday) localStorage.setItem('msr_restaurant_guest_bday', customerBirthday);
    } catch {}

    setAiSpeech(
      `Namaste ${finalName} ji! 🙏 Table 4 par aapka welcome hai. Main aapki 3D AI Concierge hu. Aaj hamare Wood-Fired Sourdough Pizzas aur Chef Starters fresh hain!`
    );
  };

  // Place Order on WhatsApp Flow
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);

    const guestName = customerName.trim() || 'Valued Guest';
    const guestPhone = customerPhone.trim() || '9519342440';

    try {
      const res = await fetch('/api/restaurant/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: guestName,
          phone: guestPhone,
          table: tableNumber,
          items: cart,
          subtotal: grandTotal,
          specialNote,
          birthday: customerBirthday,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderResult(data);
        setCart([]);
        setIsCartOpen(false);
      }
    } catch {
      // Fallback direct WhatsApp checkout
      const itemsText = cart.map((i) => `• ${i.qty}x ${i.name} (₹${i.price * i.qty})`).join('%0A');
      const waMsg = `Namaste! New Order from Table ${tableNumber} for ${guestName}:%0A${itemsText}%0ATotal: ₹${grandTotal}%0ANote: ${specialNote || 'None'}`;
      window.open(`https://wa.me/919519342440?text=${waMsg}`, '_blank');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans pb-28">
      {/* Top Ambient Glow (MSR Next Gen Emerald & Brand Glow) */}
      <div className="fixed top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-slate-950 font-black flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
          >
            M
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm sm:text-base tracking-tight">
                THE GRAND BISTRO
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                POS Sync
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold">{tableNumber}</span>
              <span>•</span>
              <span className="hidden xs:inline">{mealSlot}</span>
              <span>•</span>
              <span className="font-mono text-slate-300">{currentIST}</span>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5">
          {/* Guest Name Pill */}
          <button
            type="button"
            onClick={() => setShowWelcomeModal(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-200 px-3 py-1.5 rounded-xl transition-all"
            title="Click to edit your name"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold max-w-[80px] sm:max-w-[120px] truncate">
              {customerName ? customerName : 'Guest'}
            </span>
            <span className="text-[10px] text-slate-500">✏️</span>
          </button>

          {/* Birthday Free Cake Pass Button */}
          <button
            type="button"
            onClick={() => setShowBirthdayPassModal(true)}
            className="hidden sm:flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          >
            <Gift className="w-3.5 h-3.5 text-rose-400" />
            <span>Free Cake Pass</span>
          </button>

          {/* Cart Floating Button */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>₹{cartSubtotal}</span>
            {cartTotalQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-[#020617] animate-bounce">
                {cartTotalQty}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full pt-6 flex-1">
        {/* Table Banner & 3D Interactive Welcome */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-[#0B1528] border border-slate-800 p-5 sm:p-7 mb-7 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D AI Dining Suite • {tableNumber}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {customerName ? `Namaste, ${customerName} ji! 🙏` : 'Welcome to The Grand Bistro!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Wood-fired sourdough pizzas, truffle craft specialties & artisanal coolers. Order directly from your table — our 3D AI pairs dishes to elevate your meal and alerts the kitchen instantly on WhatsApp.
              </p>
            </div>

            {/* Quick Badges */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[90px]">
                <span className="block text-lg font-black text-emerald-400">15 min</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kitchen Prep</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center min-w-[90px]">
                <span className="block text-lg font-black text-teal-400">Instant</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Slip</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBirthdayPassModal(true)}
                className="bg-slate-950/80 border border-rose-500/30 hover:border-rose-400 p-3 rounded-2xl text-center min-w-[90px] transition-all group"
              >
                <span className="block text-lg font-black text-rose-400 group-hover:scale-105 transition-transform">🎂 Free</span>
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">Lava Cake</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Veg/Non-Veg Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gourmet pizza, truffle burger, coolers..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Veg Toggle */}
          <button
            type="button"
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all ${
              vegOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded border-2 border-emerald-500 flex items-center justify-center p-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </span>
            <span>Pure Veg Only</span>
          </button>
        </div>

        {/* Category Carousel Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {menuData.categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/25 scale-102'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const inCart = cart.find((i) => i.id === item.id);
            return (
              <div
                key={item.id}
                className="group relative bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-emerald-500/40 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Food Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Tag Badge */}
                    {item.tag && (
                      <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                        {item.tag}
                      </span>
                    )}

                    {/* Veg/Non-Veg Mark */}
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-800">
                      <span
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          item.isVeg ? 'border-emerald-500' : 'border-rose-500'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                      </span>
                    </div>

                    {/* Rating & Prep Time */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[11px] font-bold text-white">
                      <span className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{item.rating}</span>
                      </span>
                      <span className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800 text-slate-300">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{item.prepTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight mb-1.5 group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {item.calories && (
                      <span className="text-[10px] font-semibold text-slate-500">
                        {item.calories}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium">Price</span>
                    <span className="text-lg font-black text-emerald-400">₹{item.price}</span>
                  </div>

                  {/* Add to Cart Control */}
                  {inCart ? (
                    <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-1 border border-slate-700">
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white active:scale-95 transition-transform"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-emerald-400 text-sm px-1.5">
                        {inCart.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white font-extrabold text-xs px-4 py-2 rounded-xl border border-slate-700 transition-all duration-200 active:scale-95 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3D ANIMATED HOLOGRAPHIC AI POPUP CONCIERGE (CHEF MAYA)                     */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 left-4 z-40 max-w-sm">
        {/* Expanded Speech Bubble */}
        {aiAssistantOpen && (
          <div className="bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl p-4 shadow-2xl mb-3 animate-in slide-in-from-bottom-3 duration-300 relative">
            <button
              type="button"
              onClick={() => setAiAssistantOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                <ChefHat className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400">Chef Maya</span>
                <span className="text-[10px] text-slate-400 ml-1.5 font-mono">IST {currentIST}</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed mb-3">{aiSpeech}</p>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('pizzas');
                  setAiSpeech(`${customerName ? customerName + ' ji, ' : ''}Hamare 48-hour sourdough pizzas signature hain! Burrata & Pesto best seller hai.`);
                }}
                className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
              >
                🍕 Best Pizzas
              </button>
              <button
                type="button"
                onClick={() => {
                  setVegOnly(true);
                  setAiSpeech(`${customerName ? customerName + ' ji, ' : ''}Pure Veg mode activated! Chef recommended Truffle Paneer Tikka try karein.`);
                }}
                className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
              >
                🌿 Veg Specials
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBirthdayPassModal(true);
                  setAiSpeech('Advance Birthday celebration? Hum table par complimentary Chocolate Lava Cake provide karte hain! 🎂');
                }}
                className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-rose-300 px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
              >
                🎂 Free Cake Pass
              </button>
            </div>
          </div>
        )}

        {/* 3D Floating Interactive Avatar Button */}
        <button
          type="button"
          onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
          className="group flex items-center gap-3 bg-slate-900/90 hover:bg-slate-800/95 backdrop-blur-xl border border-emerald-500/40 hover:border-emerald-400 text-white p-2 sm:px-3 sm:py-2.5 rounded-full shadow-2xl transition-all active:scale-95 relative"
        >
          {/* 3D Floating Avatar Container with Animated Holographic Ring */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Rotating holographic rings */}
            <div className="absolute inset-0 rounded-full border border-emerald-500/30 border-t-emerald-400 animate-spin" />
            <div className="absolute inset-1 rounded-full border border-teal-500/20 border-b-teal-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '6s' }} />

            {/* 3D Sculpted Avatar Body */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden relative">
                {/* 3D Chef Maya Graphic (Hat + Smile + Eyes) */}
                <svg viewBox="0 0 40 40" className="w-8 h-8 transform group-hover:rotate-6 transition-transform">
                  <defs>
                    <linearGradient id="chefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  {/* Glowing 3D Hat */}
                  <path d="M12 18 C12 12, 16 8, 20 8 C24 8, 28 12, 28 18 Z" fill="url(#chefGrad)" />
                  <path d="M10 18 Q20 16 30 18 Q20 20 10 18 Z" fill="#ffffff" />
                  {/* Face */}
                  <circle cx="20" cy="25" r="7" fill="#fde047" />
                  {/* Friendly Blinking Eyes */}
                  <circle cx="18" cy="24" r="1" fill="#0f172a" />
                  <circle cx="22" cy="24" r="1" fill="#0f172a" />
                  {/* Smile */}
                  <path d="M18 27 Q20 29 22 27" stroke="#0f172a" strokeWidth="1" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Glowing Live Indicator Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse shadow-md shadow-emerald-400/50" />
          </div>

          <div className="text-left hidden sm:block pr-2">
            <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
              <span>Chef Maya</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full uppercase font-mono tracking-wider border border-emerald-500/30">
                AI Host
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Tap for smart pairings</span>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* AI AOV BOOSTER MODAL (SMART FOOD PAIRINGS)                                */}
      {/* ========================================================================= */}
      {activeUpsell && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  {activeUpsell.title || 'Chef Maya Recommendation'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveUpsell(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamically uses the actual customer name or guest! NEVER HARDCODED */}
            <h3 className="text-lg font-black text-white mb-2">
              {customerName ? `${customerName}, ` : ''}elevate your {activeUpsell.parentItem?.name}!
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              {activeUpsell.pitch}
            </p>

            {/* Combo Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-5">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-sm">{activeUpsell.addonName}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 line-through">
                    ₹{activeUpsell.addonPrice}
                  </span>
                  <span className="text-sm font-black text-emerald-400">
                    ₹{activeUpsell.discountedPrice}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
                    Save ₹50
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAcceptUpsell}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Add Combo & Save ₹50
              </button>
              <button
                type="button"
                onClick={() => setActiveUpsell(null)}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                No Thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3D HOLOGRAPHIC STREAMLINED ONBOARDING (ZERO FRICTION)                       */}
      {/* ========================================================================= */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Top Glowing Ambient Accents */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button if already entered */}
            {isOnboardingDone && (
              <button
                type="button"
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* 3D Chef Maya Interactive Avatar Banner */}
            <div className="text-center mb-5">
              <div className="relative w-20 h-20 mx-auto mb-3">
                {/* 3D Glowing Hologram Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                <div className="absolute inset-1.5 rounded-full border border-teal-500/20 border-b-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '7s' }} />

                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 mx-auto mt-2 shadow-xl shadow-emerald-500/20 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center">
                    <ChefHat className="w-8 h-8 text-emerald-400 animate-bounce" />
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold mb-1">
                <span>The Grand Bistro • Table 4</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Welcome to 3D AI Dining
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1 leading-relaxed">
                Personalized menu unlock karne ke liye enter your name:
              </p>
            </div>

            {/* Quick 1-Tap Name Chips */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                Quick Select or Type Name:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickNames.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setCustomerName(n);
                      handleSaveGuestProfile(n);
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      customerName === n
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-emerald-500/40 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Single Fast Name Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveGuestProfile();
              }}
              className="space-y-4"
            >
              <div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name (e.g. Mukul, Aman, Pooja)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-semibold"
                    autoFocus
                  />
                  {customerName && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xs">
                      ✓ Ready
                    </span>
                  )}
                </div>
              </div>

              {/* Big 3D Glow Unlock Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3.5 rounded-2xl text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Unlock 3D Menu & Recommendations</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Instant Skip Link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => handleSaveGuestProfile('Guest')}
                  className="text-xs text-slate-500 hover:text-slate-300 font-semibold transition-colors"
                >
                  ⚡ Direct Guest Browse (Skip)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIP BIRTHDAY PASS MODAL (OPTIONAL REWARD)                                 */}
      {/* ========================================================================= */}
      {showBirthdayPassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowBirthdayPassModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
                <Gift className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">
                VIP Birthday Lava Cake Pass 🎂
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Aapke special day par hamare Chef ki taraf se 1 Belgian Chocolate Lava Cake (₹249 Free) + 15% discount voucher WhatsApp par auto-dispatch hoga!
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Aapka Birthday (DD-MM)
                </label>
                <input
                  type="text"
                  value={customerBirthday}
                  onChange={(e) => setCustomerBirthday(e.target.value)}
                  placeholder="e.g. 15-10 or 25-12"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  WhatsApp Number (To Receive Cake Pass)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9519342440"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (customerBirthday) {
                    try {
                      localStorage.setItem('msr_restaurant_guest_bday', customerBirthday);
                      if (customerPhone) localStorage.setItem('msr_restaurant_guest_phone', customerPhone);
                    } catch {}
                  }
                  setShowBirthdayPassModal(false);
                  setAiSpeech(`🎉 Fantastic! Aapka Birthday Pass save ho gaya hai. Complimentary Lava Cake gift ready rahega!`);
                }}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-rose-500/20 active:scale-95 transition-all mt-2"
              >
                Claim Free Cake Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CART DRAWER & INSTANT ORDER SLIP                                         */}
      {/* ========================================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col justify-between p-5 sm:p-6 animate-in slide-in-from-right duration-300">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-white text-base">Your Table Order</h3>
                  <span className="text-xs bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                    {tableNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="py-4 space-y-3 max-h-[42vh] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-sm">Aapka cart empty hai.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="text-xs text-emerald-400 font-extrabold">
                            ₹{item.price} each
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-white px-1">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="w-6 h-6 rounded bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Optional Phone Input at Checkout for WhatsApp Ticket */}
              <div className="space-y-2 mt-2 pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400">
                    WhatsApp Number (For Instant Kitchen Ticket):
                  </label>
                  <span className="text-[10px] text-emerald-400">● Live Kitchen POS</span>
                </div>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    try { localStorage.setItem('msr_restaurant_guest_phone', e.target.value); } catch {}
                  }}
                  placeholder="e.g. 9519342440 (10 digits)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <input
                  type="text"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder="Special cooking notes (e.g. Less spicy, extra dip)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Bill Summary & WhatsApp Dispatch */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Restaurant GST (5%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-white pt-2 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-emerald-400">₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={cart.length === 0 || isPlacingOrder}
                onClick={handlePlaceOrder}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>
                  {isPlacingOrder
                    ? 'Sending to Kitchen Manager...'
                    : 'Confirm Order on WhatsApp'}
                </span>
              </button>

              <span className="block text-center text-[10px] text-slate-500">
                ⚡ Instant WhatsApp Ticket to {customerName || 'Guest'} & Kitchen Head Chef
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER CONFIRMATION MODAL WITH KITCHEN DISPATCH NOTICE                     */}
      {/* ========================================================================= */}
      {orderResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white mb-1">
              Order Dispatched to Kitchen! 👨‍🍳
            </h3>
            <span className="inline-block bg-slate-800 text-emerald-400 text-xs font-black px-3 py-1 rounded-full mb-3">
              Order #{orderResult.order?.id} • {orderResult.order?.table}
            </span>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2 mb-5">
              <p className="text-slate-300 font-semibold">
                &quot;Humne restaurant manager aur head chef ko aapka order bhej diya hai! Food 15-20 min me table par serve hoga.&quot;
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>• Guest: {orderResult.order?.customerName}</div>
                <div>• Total: ₹{orderResult.order?.subtotal}</div>
                <div>• Status: {orderResult.order?.status}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={orderResult.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Open WhatsApp Order Ticket</span>
              </a>

              <button
                type="button"
                onClick={() => setOrderResult(null)}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
