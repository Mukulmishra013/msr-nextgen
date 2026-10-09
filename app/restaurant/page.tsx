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
    'Namaste! Welcome to The Grand Bistro. Main aapka 24/7 AI Food Concierge hu. Table 4 ke liye aapko kya recommend karu?'
  );

  // Order Placement State
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<any | null>(null);

  // Live IST Time Calculation
  const [currentIST, setCurrentIST] = useState('');
  const [mealSlot, setMealSlot] = useState('Lunch Slot (Kitchen Live)');

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
        slot = 'Dinner Hours (Rooftop & Indoor Open)';
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

  // Submit Customer Onboarding
  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;
    setIsOnboardingDone(true);
    setShowWelcomeModal(false);
    setAiSpeech(
      `Namaste ${customerName} ji! 🙏 Welcome to ${tableNumber}. Main aapka AI Food Concierge hu. Aaj hamare Wood-Fired Sourdough Pizzas aur Chef Starters fresh hain!`
    );
  };

  // Place Order on WhatsApp Flow
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsPlacingOrder(true);

    try {
      const res = await fetch('/api/restaurant/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || 'Valued Guest',
          phone: customerPhone || '9519342440',
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
      const waMsg = `Namaste! New Order from Table ${tableNumber} for ${customerName || 'Guest'}:%0A${itemsText}%0ATotal: ₹${grandTotal}%0ANote: ${specialNote || 'None'}`;
      window.open(`https://wa.me/919519342440?text=${waMsg}`, '_blank');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans pb-28">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 inset-x-0 h-96 bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black flex items-center justify-center text-lg shadow-md hover:scale-105 transition-transform"
          >
            M
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-white text-sm sm:text-base tracking-tight leading-tight">
                {menuData.restaurant.name}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <ChefHat className="w-3 h-3" />
                <span>AI Powered</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {tableNumber}
              </span>
              <span>•</span>
              <span className="truncate max-w-[150px] sm:max-w-none">{mealSlot}</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">{currentIST} IST</span>
            </div>
          </div>
        </div>

        {/* Right Header: Cart Button & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Table Switcher Badge */}
          <button
            type="button"
            onClick={() => setShowWelcomeModal(true)}
            className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{customerName ? customerName : 'Guest'}</span>
          </button>

          {/* Cart Floating Toggle */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>₹{cartSubtotal}</span>
            {cartTotalQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-[#0F172A] animate-bounce">
                {cartTotalQty}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full pt-6 flex-1">
        {/* Table Banner & Personalized Greeting */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/90 border border-slate-800 p-5 sm:p-7 mb-7 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart QR Table Experience • {tableNumber}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {customerName ? `Namaste, ${customerName} ji! 🙏` : 'Welcome to The Grand Bistro!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Wood-fired sourdough, smoked charcoal delicacies & artisanal coolers. Order from your phone, AI pairs your food, and WhatsApp alerts the kitchen instantly.
              </p>
            </div>

            {/* Quick Stats / Info Badges */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center min-w-[90px]">
                <span className="block text-lg font-black text-amber-400">15 min</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Serve Time</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center min-w-[90px]">
                <span className="block text-lg font-black text-emerald-400">₹0 Wait</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instant WhatsApp</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center min-w-[90px]">
                <span className="block text-lg font-black text-rose-400">Free Cake</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On Birthday 🎂</span>
              </div>
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
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-102'
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
                className="group relative bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-amber-500/40 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
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
                      <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
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
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.prepTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight mb-1.5 group-hover:text-amber-400 transition-colors">
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
                    <span className="text-lg font-black text-white">₹{item.price}</span>
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
                      <span className="font-black text-amber-400 text-sm px-1.5">
                        {inCart.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold text-xs px-4 py-2 rounded-xl border border-slate-700 transition-all duration-200 active:scale-95 shadow-sm"
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
      {/* 3D-STYLED INTERACTIVE AI POPUP CONCIERGE (CHEF MAYA)                      */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 left-4 z-40 max-w-sm">
        {/* Expanded Speech Bubble */}
        {aiAssistantOpen ? (
          <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-3xl p-4 shadow-2xl mb-3 animate-in slide-in-from-bottom-3 duration-300 relative">
            <button
              type="button"
              onClick={() => setAiAssistantOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-400">Chef Maya • AI Concierge</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed mb-3">{aiSpeech}</p>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('pizzas');
                  setAiSpeech('Hamare 48-hour sourdough pizzas signature hain! Burrata & Pesto best seller hai.');
                }}
                className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
              >
                🍕 Best Pizzas
              </button>
              <button
                type="button"
                onClick={() => {
                  setVegOnly(true);
                  setAiSpeech('Pure Veg mode activated! Chef ke recommended paneer tikka aur biryani try karein.');
                }}
                className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
              >
                🌿 Veg Specials
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('desserts');
                  setAiSpeech('Birthday guest hain? Hum Table par Molten Chocolate Lava cake free provide karte hain!');
                }}
                className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-rose-300 px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
              >
                🎂 Birthday Cake Offer
              </button>
            </div>
          </div>
        ) : null}

        {/* 3D Floating Avatar Button */}
        <button
          type="button"
          onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
          className="group flex items-center gap-3 bg-slate-900/90 hover:bg-slate-800/95 backdrop-blur-xl border border-amber-500/40 hover:border-amber-400 text-white p-2 sm:px-3 sm:py-2.5 rounded-full shadow-2xl transition-all active:scale-95"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-emerald-400 flex items-center justify-center font-black text-slate-950 shadow-md">
              <ChefHat className="w-5 h-5 text-slate-950" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>
          <div className="text-left hidden sm:block pr-2">
            <div className="text-xs font-black text-amber-300 flex items-center gap-1">
              <span>Chef Maya</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full uppercase">3D AI</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Tap for recommendations</span>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* AI AOV BOOSTER MODAL (SMART FOOD PAIRINGS)                                */}
      {/* ========================================================================= */}
      {activeUpsell && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  {activeUpsell.title || 'AI Chef Recommendation'}
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

            <h3 className="text-lg font-black text-white mb-2">
              Rahul, elevate your {activeUpsell.parentItem?.name}!
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              {activeUpsell.pitch}
            </p>

            {/* Combo Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-5">
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
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
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
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
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
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
      {/* ONBOARDING & NAME CAPTURE MODAL (QR SCAN FIRST TIME)                      */}
      {/* ========================================================================= */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm sm:text-base">
                    Table QR Menu
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    ● Connected to Kitchen POS
                  </span>
                </div>
              </div>
              {isOnboardingDone && (
                <button
                  type="button"
                  onClick={() => setShowWelcomeModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Personalized menu unlock karne aur WhatsApp par instant order updates paane ke liye enter your details:
            </p>

            <form onSubmit={handleOnboardingSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Aapka Naam (First Name)*
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  WhatsApp Number (For Instant Kitchen Ticket)*
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9519342440"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Table Number
                  </label>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Table 1">Table 1 (Indoor)</option>
                    <option value="Table 2">Table 2 (Window)</option>
                    <option value="Table 3">Table 3 (Booth)</option>
                    <option value="Table 4">Table 4 (Garden Patio)</option>
                    <option value="Table 5">Table 5 (Rooftop)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Birthday (DD-MM) 🎂
                  </label>
                  <input
                    type="text"
                    value={customerBirthday}
                    onChange={(e) => setCustomerBirthday(e.target.value)}
                    placeholder="e.g. 15-10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Unlock Personal Menu & Free Cake Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
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
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="font-black text-white text-base">Your Table Order</h3>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
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
              <div className="py-4 space-y-3 max-h-[45vh] overflow-y-auto">
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
                          <span className="text-xs text-amber-400 font-extrabold">
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
                          className="w-6 h-6 rounded bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Special Cooking Request Note */}
              <div className="mt-2">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Special Cooking Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder="e.g. Less spicy, extra green chutney, birthday note..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  <span className="text-amber-400">₹{grandTotal}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={cart.length === 0 || isPlacingOrder}
                onClick={handlePlaceOrder}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>
                  {isPlacingOrder
                    ? 'Sending to Kitchen Manager...'
                    : 'Confirm Order on WhatsApp'}
                </span>
              </button>

              <span className="block text-center text-[10px] text-slate-500">
                ⚡ Instant WhatsApp Alert to Manager + Head Chef
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
            <span className="inline-block bg-slate-800 text-amber-400 text-xs font-black px-3 py-1 rounded-full mb-3">
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
