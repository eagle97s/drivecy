"use client";

import Link from "next/link";
import { Car, Globe, Mail } from "lucide-react";
import { useI18n } from "@/i18n/context";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Drive<span className="text-primary">CY</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">{t("footer.tagline")}</p>
            <div className="mt-6 flex items-center gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t("footer.browse")}</h3>
            <ul className="space-y-3">
              <li><Link href="/cars" className="text-sm text-muted-foreground hover:text-foreground">{t("footer.allCars")}</Link></li>
              <li><Link href="/cars?bodyType=SUV" className="text-sm text-muted-foreground hover:text-foreground">{t("footer.suvs")}</Link></li>
              <li><Link href="/cars?fuelType=Electric" className="text-sm text-muted-foreground hover:text-foreground">{t("footer.electric")}</Link></li>
              <li><Link href="/cars?bodyType=Sedan" className="text-sm text-muted-foreground hover:text-foreground">{t("footer.sedans")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t("footer.popular")}</h3>
            <ul className="space-y-3">
              <li><Link href="/cars?make=Toyota" className="text-sm text-muted-foreground hover:text-foreground">Toyota</Link></li>
              <li><Link href="/cars?make=BMW" className="text-sm text-muted-foreground hover:text-foreground">BMW</Link></li>
              <li><Link href="/cars?make=Mercedes-Benz" className="text-sm text-muted-foreground hover:text-foreground">Mercedes</Link></li>
              <li><Link href="/cars?make=Audi" className="text-sm text-muted-foreground hover:text-foreground">Audi</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t("footer.company")}</h3>
            <ul className="space-y-3">
              <li><Link href="/sell" className="text-sm text-muted-foreground hover:text-foreground">{t("footer.sellYourCar")}</Link></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">{t("footer.aboutUs")}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">{t("footer.contact")}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">{t("footer.privacy")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">{t("footer.rights")}</p>
          <p className="text-xs text-muted-foreground">{t("footer.madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
