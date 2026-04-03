"use client";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { listings as seedListings } from "@/data/cars";
import { useListings } from "@/hooks/use-listings";
import { CarCard } from "@/components/car-card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, ChevronLeft, ChevronRight, Heart, Share2, Fuel, Gauge, Calendar, Settings, Palette, DoorOpen } from "lucide-react";

export default function CarDetailPage() {
  const { id } = useParams();
  const { listings } = useListings();
  const car = listings.find(c => c.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (!car) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl block mb-4">🚗</span>
            <h1 className="text-2xl font-bold text-foreground mb-2">Car not found</h1>
            <Link href="/cars"><Button>Browse all cars</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const similar = listings.filter(c => c.id !== car.id && c.make === car.make).slice(0, 3);

  const specs = [
    { icon: Calendar, label: "Year", value: car.year },
    { icon: Gauge, label: "Mileage", value: `${car.mileage.toLocaleString()} km` },
    { icon: Fuel, label: "Fuel", value: car.fuelType },
    { icon: Settings, label: "Transmission", value: car.transmission },
    { icon: Fuel, label: "Engine", value: car.engineSize },
    { icon: Gauge, label: "Power", value: `${car.horsepower} HP` },
    { icon: Palette, label: "Color", value: car.color },
    { icon: DoorOpen, label: "Doors", value: car.doors },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/cars" className="hover:text-foreground">Cars</Link>
            <span>/</span>
            <Link href={`/cars?make=${car.make}`} className="hover:text-foreground">{car.make}</Link>
            <span>/</span>
            <span className="text-foreground">{car.model}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Images + Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Image */}
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-muted">
                <Image
                  src={car.images[selectedImage]}
                  alt={`${car.title} - Photo ${selectedImage + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(i => i > 0 ? i - 1 : car.images.length - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur hover:bg-background/80 text-foreground w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(i => i < car.images.length - 1 ? i + 1 : 0)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur hover:bg-background/80 text-foreground w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/60 backdrop-blur text-foreground text-xs px-3 py-1 rounded-full">
                  {selectedImage + 1} / {car.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {car.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === i ? "border-primary shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>

              {/* Description */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-bold text-lg text-foreground mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{car.description}</p>
              </div>

              {/* Specs */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-bold text-lg text-foreground mb-4">Specifications</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {specs.map((spec) => (
                    <div key={spec.label} className="rounded-lg bg-secondary/50 p-3 text-center">
                      <spec.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                      <span className="block text-xs text-muted-foreground">{spec.label}</span>
                      <span className="block font-semibold text-foreground text-sm mt-0.5">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-bold text-lg text-foreground mb-4">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feature) => (
                    <span key={feature} className="bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-full font-medium">
                      ✓ {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Price + Seller */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Price Card */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-xl font-bold text-foreground">{car.title}</h1>
                      <p className="text-sm text-muted-foreground mt-1">📍 {car.city} • {car.bodyType}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setIsLiked(!isLiked)} className={isLiked ? "text-red-500" : ""}>
                        <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-foreground">€{car.price.toLocaleString()}</span>
                  </div>

                  {/* Quick specs */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: "Year", value: String(car.year), icon: "📅" },
                      { label: "Km", value: `${(car.mileage / 1000).toFixed(0)}k`, icon: "🛣️" },
                      { label: "Fuel", value: car.fuelType, icon: "⛽" },
                      { label: "Trans.", value: car.transmission === "Automatic" ? "Auto" : "Manual", icon: "⚙️" },
                    ].map(s => (
                      <div key={s.label} className="rounded-lg bg-secondary/50 p-3 text-center">
                        <span className="text-lg">{s.icon}</span>
                        <span className="block text-sm font-bold text-foreground">{s.value}</span>
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seller Card */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-bold text-foreground mb-4">Seller</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">{car.sellerName[0]}</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-foreground">{car.sellerName}</span>
                      <span className="text-xs text-muted-foreground">Private Seller</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowPhone(!showPhone)}
                    className="w-full gap-2 mb-3"
                  >
                    <Phone className="h-4 w-4" />
                    {showPhone ? car.sellerPhone : "Show Phone Number"}
                  </Button>

                  <a
                    href={`https://wa.me/${car.sellerPhone.replace(/[^0-9+]/g, "").replace("+", "")}?text=${encodeURIComponent(`Hi, I'm interested in your ${car.title} listed on DriveCY for €${car.price.toLocaleString()}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full gap-2 border-green-700 text-green-400 hover:bg-green-900/20">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                </div>

                {/* Safety tip */}
                <div className="rounded-xl border border-yellow-800/50 bg-yellow-900/10 p-4">
                  <p className="text-yellow-400 text-sm font-medium">💡 Safety Tip</p>
                  <p className="text-yellow-500/80 text-xs mt-1">Always meet in a public place and inspect the vehicle before payment.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Similar */}
          {similar.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">Similar {car.make} Vehicles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similar.map(c => <CarCard key={c.id} car={c} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
