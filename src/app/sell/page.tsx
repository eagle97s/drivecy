"use client";
import { useState } from "react";
import { carMakes, fuelTypes, transmissions, bodyTypes, colors, cities } from "@/data/cars";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export default function SellPage() {
  const [make, setMake] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const models = make ? carMakes[make] || [] : [];

  const inputClass = "w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <span className="text-6xl block mb-6">🎉</span>
            <h1 className="text-3xl font-bold text-foreground mb-3">Listing Submitted!</h1>
            <p className="text-muted-foreground text-lg mb-8">Your car will be reviewed and published shortly.</p>
            <a href="/"><Button size="lg">Back to Home</Button></a>
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
            <h1 className="text-3xl font-bold text-foreground">Sell Your Car</h1>
            <p className="text-muted-foreground mt-2">Fill in the details below to list your vehicle on DriveCY</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-8">
            {/* Vehicle Info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg text-foreground mb-5">🚗 Vehicle Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Make *</label>
                  <select required value={make} onChange={(e) => setMake(e.target.value)} className={inputClass}>
                    <option value="">Select Make</option>
                    {Object.keys(carMakes).sort().map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Model *</label>
                  <select required disabled={!make} className={`${inputClass} disabled:opacity-50`}>
                    <option value="">Select Model</option>
                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Year *</label>
                  <select required className={inputClass}>
                    <option value="">Select Year</option>
                    {Array.from({ length: 37 }, (_, i) => 2026 - i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Body Type *</label>
                  <select required className={inputClass}>
                    <option value="">Select Type</option>
                    {bodyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Fuel Type *</label>
                  <select required className={inputClass}>
                    <option value="">Select Fuel</option>
                    {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Transmission *</label>
                  <select required className={inputClass}>
                    <option value="">Select</option>
                    {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Color</label>
                  <select className={inputClass}>
                    <option value="">Select Color</option>
                    {colors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Mileage (km) *</label>
                  <input required type="number" placeholder="e.g. 85000" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Price & Location */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg text-foreground mb-5">💰 Price & Location</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Price (€) *</label>
                  <input required type="number" placeholder="e.g. 15000" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">City *</label>
                  <select required className={inputClass}>
                    <option value="">Select City</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg text-foreground mb-5">📝 Description</h2>
              <textarea
                rows={5}
                placeholder="Describe your car — condition, history, features..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Photos */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg text-foreground mb-5">📸 Photos</h2>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Camera className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-foreground font-medium">Click to upload photos</p>
                <p className="text-muted-foreground text-sm mt-1">Up to 20 photos, max 5MB each</p>
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg text-foreground mb-5">📱 Contact Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Your Name *</label>
                  <input required type="text" placeholder="e.g. Andreas" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Phone *</label>
                  <input required type="tel" placeholder="+357 9X XXXXXX" className={inputClass} />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-lg py-6">
              🚀 Publish Listing — Free
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
