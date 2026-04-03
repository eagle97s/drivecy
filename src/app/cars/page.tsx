"use client";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { listings, carMakes, fuelTypes, transmissions, bodyTypes, cities } from "@/data/cars";
import { CarCard } from "@/components/car-card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";

function CarsContent() {
  const searchParams = useSearchParams();

  const [make, setMake] = useState(searchParams.get("make") || "");
  const [model, setModel] = useState(searchParams.get("model") || "");
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [yearMin, setYearMin] = useState(searchParams.get("yearMin") || "");
  const [yearMax, setYearMax] = useState(searchParams.get("yearMax") || "");
  const [fuelType, setFuelType] = useState(searchParams.get("fuelType") || "");
  const [transmission, setTransmission] = useState(searchParams.get("transmission") || "");
  const [bodyType, setBodyType] = useState(searchParams.get("bodyType") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const models = make ? carMakes[make] || [] : [];

  const filtered = useMemo(() => {
    let result = [...listings];
    if (make) result = result.filter(c => c.make === make);
    if (model) result = result.filter(c => c.model === model);
    if (priceMin) result = result.filter(c => c.price >= Number(priceMin));
    if (priceMax) result = result.filter(c => c.price <= Number(priceMax));
    if (yearMin) result = result.filter(c => c.year >= Number(yearMin));
    if (yearMax) result = result.filter(c => c.year <= Number(yearMax));
    if (fuelType) result = result.filter(c => c.fuelType === fuelType);
    if (transmission) result = result.filter(c => c.transmission === transmission);
    if (bodyType) result = result.filter(c => c.bodyType === bodyType);
    if (city) result = result.filter(c => c.city === city);

    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "year-desc": result.sort((a, b) => b.year - a.year); break;
      case "mileage-asc": result.sort((a, b) => a.mileage - b.mileage); break;
    }
    return result;
  }, [make, model, priceMin, priceMax, yearMin, yearMax, fuelType, transmission, bodyType, city, sortBy]);

  const clearFilters = () => {
    setMake(""); setModel(""); setPriceMin(""); setPriceMax("");
    setYearMin(""); setYearMax(""); setFuelType(""); setTransmission("");
    setBodyType(""); setCity("");
  };

  const activeFilterCount = [make, model, priceMin, priceMax, yearMin, yearMax, fuelType, transmission, bodyType, city].filter(Boolean).length;

  const selectClass = "w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Browse Cars</h1>
              <p className="text-muted-foreground mt-1">{filtered.length} vehicles found</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="year-desc">Year: Newest</option>
                <option value="mileage-asc">Mileage: Lowest</option>
              </select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className={`${showFilters ? "fixed inset-0 z-50 bg-background p-6 overflow-y-auto lg:relative lg:inset-auto lg:bg-transparent lg:p-0" : "hidden"} lg:block w-full lg:w-64 flex-shrink-0`}>
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg text-foreground">Filters</h2>
                  <div className="flex gap-3">
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-xs text-primary hover:text-primary/80 font-medium">Clear all</button>
                    )}
                    <button onClick={() => setShowFilters(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Make</label>
                    <select value={make} onChange={(e) => { setMake(e.target.value); setModel(""); }} className={selectClass}>
                      <option value="">All Makes</option>
                      {Object.keys(carMakes).sort().map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Model</label>
                    <select value={model} onChange={(e) => setModel(e.target.value)} disabled={!make} className={`${selectClass} disabled:opacity-50`}>
                      <option value="">All Models</option>
                      {models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Price (€)</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className={selectClass} />
                      <input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className={selectClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Year</label>
                    <div className="flex gap-2">
                      <select value={yearMin} onChange={(e) => setYearMin(e.target.value)} className={selectClass}>
                        <option value="">From</option>
                        {Array.from({ length: 37 }, (_, i) => 2026 - i).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select value={yearMax} onChange={(e) => setYearMax(e.target.value)} className={selectClass}>
                        <option value="">To</option>
                        {Array.from({ length: 37 }, (_, i) => 2026 - i).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Body Type</label>
                    <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className={selectClass}>
                      <option value="">All Types</option>
                      {bodyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Fuel Type</label>
                    <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={selectClass}>
                      <option value="">All Fuels</option>
                      {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Transmission</label>
                    <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className={selectClass}>
                      <option value="">All</option>
                      {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">City</label>
                    <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
                      <option value="">All Cyprus</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <Button onClick={() => setShowFilters(false)} className="lg:hidden w-full mt-6">
                  Show {filtered.length} results
                </Button>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <span className="text-5xl block mb-4">😕</span>
                  <h3 className="text-xl font-bold text-foreground mb-2">No cars found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                  <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CarsContent />
    </Suspense>
  );
}
