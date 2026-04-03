"use client";
import { useState } from "react";
import { carMakes, fuelTypes, transmissions, bodyTypes, colors, cities } from "@/data/cars";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PhotoUpload } from "@/components/photo-upload";
import { ListingReview } from "@/components/listing-review";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n/context";
import { useAuth } from "@/hooks/use-auth";

export default function SellPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [color, setColor] = useState("");
  const [mileage, setMileage] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState(false);

  const handleCorrections = (corrections: Record<string, string>) => {
    if (corrections.make) setMake(corrections.make);
    if (corrections.model) setModel(corrections.model);
    if (corrections.year) setYear(corrections.year);
    if (corrections.color) setColor(corrections.color);
    if (corrections.body_type) setBodyType(corrections.body_type);
    if (corrections.mileage) setMileage(corrections.mileage);
    if (corrections.price) setPrice(corrections.price);
    if (corrections.description) setDescription(corrections.description);
  };

  const models = make ? carMakes[make] || [] : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAiAnalysis = (analysis: any) => {
    // Make — fuzzy match
    if (analysis.make) {
      const allMakes = Object.keys(carMakes);
      const exactMatch = allMakes.find(m => m.toLowerCase() === analysis.make.toLowerCase());
      const partialMatch = allMakes.find(m => m.toLowerCase().includes(analysis.make.toLowerCase()) || analysis.make.toLowerCase().includes(m.toLowerCase()));
      const matchedMake = exactMatch || partialMatch;
      if (matchedMake) {
        setMake(matchedMake);
        // Model — fuzzy match within the make
        if (analysis.model) {
          const makeModels = carMakes[matchedMake] || [];
          const exactModel = makeModels.find(m => m.toLowerCase() === analysis.model.toLowerCase());
          const partialModel = makeModels.find(m => m.toLowerCase().includes(analysis.model.toLowerCase()) || analysis.model.toLowerCase().includes(m.toLowerCase()));
          if (exactModel || partialModel) setModel(exactModel || partialModel || "");
        }
      }
    }

    // Year
    if (analysis.year_estimate) {
      const yearStr = String(analysis.year_estimate);
      const yearMatch = yearStr.match(/\d{4}/);
      if (yearMatch) setYear(yearMatch[0]);
    }

    // Color — fuzzy match
    if (analysis.color) {
      const matched = colors.find(c => c.toLowerCase() === analysis.color.toLowerCase());
      const partial = colors.find(c => analysis.color.toLowerCase().includes(c.toLowerCase()));
      if (matched || partial) setColor(matched || partial || "");
    }

    // Body type — fuzzy match
    if (analysis.body_type) {
      const matched = bodyTypes.find(b => b.toLowerCase() === analysis.body_type.toLowerCase());
      if (matched) setBodyType(matched);
    }

    // Fuel type
    if (analysis.fuel_type) {
      const matched = fuelTypes.find(f => f.toLowerCase() === analysis.fuel_type.toLowerCase());
      if (matched) setFuelType(matched);
    }

    // Transmission
    if (analysis.transmission) {
      const matched = transmissions.find(t => t.toLowerCase() === analysis.transmission.toLowerCase());
      if (matched) setTransmission(matched);
    }

    // Mileage — from odometer reading or estimate
    if (analysis.mileage_estimate) {
      const km = parseInt(String(analysis.mileage_estimate).replace(/[^0-9]/g, ""));
      if (km > 0) setMileage(km.toString());
    } else if (analysis.dashboard_reading) {
      const reading = String(analysis.dashboard_reading).toLowerCase();
      const numMatch = reading.match(/[\d,]+/);
      if (numMatch) {
        let km = parseInt(numMatch[0].replace(/,/g, ""));
        if (reading.includes("mile") || reading.includes("mph")) {
          km = Math.round(km * 1.609);
        }
        if (km > 0) setMileage(km.toString());
      }
    }
  };

  const inputClass = "w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const title = `${year} ${make} ${model}`;

    const { error: dbError } = await supabase.from("listings").insert({
      make,
      model,
      year: Number(year),
      price: Number(price),
      mileage: Number(mileage),
      fuel_type: fuelType,
      transmission,
      body_type: bodyType,
      color: color || null,
      title,
      description: description || null,
      city,
      seller_name: sellerName,
      seller_phone: sellerPhone,
      features: [],
      images: photos.length > 0 ? photos : [`https://picsum.photos/seed/${Date.now()}/800/600`],
      user_id: user?.id || null,
      status: "active",
    });

    setLoading(false);

    if (dbError) {
      setError(`Failed to submit: ${dbError.message}`);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <span className="text-6xl block mb-6">🎉</span>
            <h1 className="text-3xl font-bold text-foreground mb-3">{t("sell.submitted")}</h1>
            <p className="text-muted-foreground text-lg mb-8">{t("sell.submittedSub")}</p>
            <a href="/"><Button size="lg">{t("sell.backHome")}</Button></a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">{t("sell.title")}</h1>
            <p className="text-muted-foreground mt-2">{t("sell.subtitle")}</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-800/50 bg-red-900/10 p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photos — FIRST so AI can auto-fill */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg text-foreground mb-5">📸 {t("sell.photos")}</h2>
              <PhotoUpload images={photos} onChange={setPhotos} onAnalysis={handleAiAnalysis} maxPhotos={20} />
            </div>

            {/* Vehicle Info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg text-foreground mb-5">🚗 {t("sell.vehicleInfo")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.make")}</label>
                  <select required value={make} onChange={(e) => { setMake(e.target.value); setModel(""); }} className={inputClass}>
                    <option value="">Select Make</option>
                    {Object.keys(carMakes).sort().map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.model")}</label>
                  <select required value={model} onChange={(e) => setModel(e.target.value)} disabled={!make} className={`${inputClass} disabled:opacity-50`}>
                    <option value="">Select Model</option>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.year")}</label>
                  <select required value={year} onChange={(e) => setYear(e.target.value)} className={inputClass}>
                    <option value="">Select Year</option>
                    {Array.from({ length: 37 }, (_, i) => 2026 - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.bodyType")}</label>
                  <select required value={bodyType} onChange={(e) => setBodyType(e.target.value)} className={inputClass}>
                    <option value="">Select Type</option>
                    {bodyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.fuelType")}</label>
                  <select required value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={inputClass}>
                    <option value="">Select Fuel</option>
                    {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.transmission")}</label>
                  <select required value={transmission} onChange={(e) => setTransmission(e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.color")}</label>
                  <select value={color} onChange={(e) => setColor(e.target.value)} className={inputClass}>
                    <option value="">Select Color</option>
                    {colors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.mileage")}</label>
                  <input required type="number" placeholder="e.g. 85000" value={mileage} onChange={(e) => setMileage(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Price & Location */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg text-foreground mb-5">💰 {t("sell.priceLocation")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.price")}</label>
                  <input required type="number" placeholder="e.g. 15000" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.city")}</label>
                  <select required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg text-foreground mb-5">📝 {t("sell.description")}</h2>
              <textarea
                rows={5}
                placeholder={t("sell.descPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Contact */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg text-foreground mb-5">📱 {t("sell.contact")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.name")}</label>
                  <input required type="text" placeholder="e.g. Andreas" value={sellerName} onChange={(e) => setSellerName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">{t("sell.phone")}</label>
                  <input required type="tel" placeholder="+357 9X XXXXXX" value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* AI Review Step */}
            {!showReview ? (
              <Button
                type="button"
                size="lg"
                className="w-full text-lg py-6"
                onClick={() => {
                  // Basic validation before review
                  if (!make || !model || !year || !price || !mileage || !city || !sellerName || !sellerPhone || !fuelType || !transmission || !bodyType) {
                    setError("Please fill in all required fields before reviewing.");
                    return;
                  }
                  setError("");
                  setShowReview(true);
                }}
              >
                🤖 Review & Publish
              </Button>
            ) : (
              <>
                <ListingReview
                  listing={{
                    title: `${year} ${make} ${model}`,
                    make,
                    model,
                    year,
                    price,
                    mileage,
                    fuelType,
                    transmission,
                    bodyType,
                    color,
                    city,
                    description,
                    images: photos,
                  }}
                  onCorrections={handleCorrections}
                  onApprove={() => {
                    // Trigger the actual form submit
                    const form = document.querySelector("form");
                    if (form) {
                      form.requestSubmit();
                    }
                  }}
                />

                {loading && (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Publishing your listing...</p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowReview(false)}
                >
                  ← Back to edit
                </Button>
              </>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
