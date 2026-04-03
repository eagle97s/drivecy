"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { carMakes, cities } from "@/data/cars";
import { useI18n } from "@/i18n/context";

const priceRanges = [
  { value: "", labelKey: "hero.anyPrice" },
  { value: "5000", amount: "€5,000" },
  { value: "10000", amount: "€10,000" },
  { value: "20000", amount: "€20,000" },
  { value: "30000", amount: "€30,000" },
  { value: "50000", amount: "€50,000" },
];

export function HeroSection() {
  const router = useRouter();
  const { t } = useI18n();
  const makesList = [t("hero.allMakes"), ...Object.keys(carMakes).sort()];
  const cityList = [t("hero.allCyprus"), ...cities];

  const [selectedMake, setSelectedMake] = useState(t("hero.allMakes"));
  const [selectedPriceValue, setSelectedPriceValue] = useState("");
  const [selectedPriceLabel, setSelectedPriceLabel] = useState(t("hero.anyPrice"));
  const [selectedCity, setSelectedCity] = useState(t("hero.allCyprus"));
  const [makeOpen, setMakeOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedMake !== t("hero.allMakes")) params.set("make", selectedMake);
    if (selectedPriceValue) params.set("priceMax", selectedPriceValue);
    if (selectedCity !== t("hero.allCyprus")) params.set("city", selectedCity);
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src="/images/hero-car.jpg" alt="Premium car" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="max-w-2xl">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t("hero.title")}
            <span className="block text-primary">{t("hero.titleAccent")}</span>
          </h1>
          <p className="mt-4 text-pretty text-lg text-muted-foreground sm:text-xl">
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* Make */}
              <div className="relative flex-1">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("hero.make")}</label>
                <button onClick={() => { setMakeOpen(!makeOpen); setPriceOpen(false); setCityOpen(false); }}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground transition-colors hover:border-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  {selectedMake}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {makeOpen && (
                  <div className="absolute left-0 top-full z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-lg">
                    {makesList.map((make) => (
                      <button key={make} onClick={() => { setSelectedMake(make); setMakeOpen(false); }}
                        className="block w-full px-4 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                        {make}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="relative flex-1">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("hero.price")}</label>
                <button onClick={() => { setPriceOpen(!priceOpen); setMakeOpen(false); setCityOpen(false); }}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground transition-colors hover:border-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  {selectedPriceLabel}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {priceOpen && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-border bg-popover py-1 shadow-lg">
                    {priceRanges.map((p) => {
                      const label = p.labelKey ? t(p.labelKey) : `${t("hero.upTo")} ${p.amount}`;
                      return (
                        <button key={p.value || "any"} onClick={() => { setSelectedPriceValue(p.value); setSelectedPriceLabel(label); setPriceOpen(false); }}
                          className="block w-full px-4 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* City */}
              <div className="relative flex-1">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">{t("hero.location")}</label>
                <button onClick={() => { setCityOpen(!cityOpen); setMakeOpen(false); setPriceOpen(false); }}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground transition-colors hover:border-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{selectedCity}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {cityOpen && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-border bg-popover py-1 shadow-lg">
                    {cityList.map((city) => (
                      <button key={city} onClick={() => { setSelectedCity(city); setCityOpen(false); }}
                        className="block w-full px-4 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button size="lg" className="gap-2 bg-primary px-8 text-primary-foreground hover:bg-primary/90" onClick={handleSearch}>
                <Search className="h-4 w-4" />
                {t("hero.search")}
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">60+</span>
                <span className="text-sm text-muted-foreground">{t("hero.vehicles")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">30+</span>
                <span className="text-sm text-muted-foreground">{t("hero.brands")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">🇨🇾</span>
                <span className="text-sm text-muted-foreground">{t("hero.allCyprus")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
