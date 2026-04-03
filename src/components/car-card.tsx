"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Fuel, Gauge, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CarListing } from "@/data/cars";

export function CarCard({ car }: { car: CarListing }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const badge = car.year >= 2024 ? "New" : car.fuelType === "Electric" ? "⚡ EV" : car.mileage < 30000 ? "Low KM" : undefined;

  return (
    <Link href={`/cars/${car.id}`}>
      <article className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={car.images[0]}
            alt={car.title}
            fill
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Badge */}
          {badge && (
            <div className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
              {badge}
            </div>
          )}

          {/* Like Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
            className={cn(
              "absolute right-3 top-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur transition-all hover:bg-background",
              isLiked && "text-red-500"
            )}
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          </Button>

          {/* Photo count */}
          <div className="absolute bottom-3 right-3 rounded-full bg-background/70 px-2 py-1 text-xs text-foreground backdrop-blur">
            📷 {car.images.length}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                {car.title}
              </h3>
              <p className="text-sm text-muted-foreground">📍 {car.city}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">
                €{car.price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Specs */}
          <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Gauge className="h-4 w-4" />
              <span className="text-xs">{(car.mileage / 1000).toFixed(0)}k km</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Fuel className="h-4 w-4" />
              <span className="text-xs">{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">{car.year}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
