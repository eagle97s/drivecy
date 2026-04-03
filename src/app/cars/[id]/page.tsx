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

                  {/* Messaging buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={`https://wa.me/${car.sellerPhone.replace(/[^0-9+]/g, "").replace("+", "")}?text=${encodeURIComponent(`Hi, I'm interested in your ${car.title} on DriveCY for €${car.price.toLocaleString()}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full gap-1.5 border-green-700 text-green-400 hover:bg-green-900/20 text-xs px-2">
                        <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                        WhatsApp
                      </Button>
                    </a>
                    <a
                      href={`https://t.me/+${car.sellerPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full gap-1.5 border-blue-700 text-blue-400 hover:bg-blue-900/20 text-xs px-2">
                        <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                        Telegram
                      </Button>
                    </a>
                    <a
                      href={`viber://chat?number=+${car.sellerPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full gap-1.5 border-purple-700 text-purple-400 hover:bg-purple-900/20 text-xs px-2">
                        <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.177.523 6.752.392 9.9.262 13.052.479 18.267.479 18.267l-.347 3.652s-.094.885.548 1.064c.774.215 1.225-.502 1.963-1.303.405-.44.963-1.087 1.384-1.581 3.823.322 6.754-.414 7.091-.525.778-.256 5.176-.816 5.893-6.657.74-6.021-.36-9.826-2.345-11.552 0 0-1.479-1.323-5.268-1.363zM11.715 1.6c3.469.013 4.912 1.072 4.912 1.072 1.632 1.42 2.596 4.775 1.964 9.862-.59 4.81-4.206 5.047-4.862 5.262-.277.092-2.864.721-6.164.528 0 0-2.442 2.943-3.203 3.708-.12.121-.26.166-.353.144-.13-.032-.166-.186-.165-.412.003-.332.02-4.137.02-4.137S3.674 17.333 3.79 14.5c.117-2.832.787-5.075 2.273-6.544C7.878 6.164 11.715 1.587 11.715 1.6zm-.07 3.2c-.12-.002-.12.176 0 .178 1.425.073 2.633.572 3.584 1.46.937.88 1.449 2.022 1.544 3.392.009.13.2.128.191 0-.066-1.456-.607-2.682-1.602-3.612-.986-.922-2.268-1.347-3.718-1.418zm-1.19 1.228a.455.455 0 0 0-.313.127l-.382.371c-.118.113-.151.272-.094.417.347.878.803 1.574 1.544 2.376l.012.014c.661.716 1.468 1.291 2.408 1.723.156.071.326.032.446-.082l.35-.37a.456.456 0 0 0 .057-.508c-.256-.468-.523-.817-.925-1.227a.455.455 0 0 0-.551-.073l-.4.237c-.117.07-.263.038-.357-.053-.36-.347-.635-.642-.886-1.035-.077-.12-.065-.275.03-.382l.26-.373a.455.455 0 0 0-.011-.544c-.373-.5-.705-.797-1.148-1.195a.456.456 0 0 0-.041-.033.455.455 0 0 0-.2-.059zm1.544.746c-.086 0-.082.129 0 .133 1.006.085 1.813.63 2.372 1.416.294.413.472.86.528 1.362.014.122.196.108.183-.013-.058-.545-.253-1.04-.572-1.488-.608-.853-1.49-1.324-2.511-1.41zm.15 1.097c-.08-.003-.094.113-.013.127.704.162 1.17.59 1.378 1.3.027.092.176.06.15-.033-.164-.597-.498-1.044-1.043-1.297a1.63 1.63 0 0 0-.472-.097z"/></svg>
                        Viber
                      </Button>
                    </a>
                  </div>
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
