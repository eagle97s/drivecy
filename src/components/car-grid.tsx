"use client";

import { CarCard } from "./car-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { listings } from "@/data/cars";
import { useI18n } from "@/i18n/context";

export function CarGrid() {
  const { t } = useI18n();
  const featured = listings.slice(0, 6);

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("grid.featured")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("grid.featuredSub")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/cars">
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {t("grid.browseAll")}
              </Button>
            </Link>
            <Link href="/cars">
              <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary/80">
                {t("grid.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/cars">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              {t("grid.viewAllCount", { count: listings.length })}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
