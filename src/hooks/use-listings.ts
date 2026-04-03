"use client";
import { useState, useEffect } from "react";
import { supabase, DbListing } from "@/lib/supabase";
import { listings as seedListings, CarListing } from "@/data/cars";

function dbToCarListing(db: DbListing): CarListing {
  return {
    id: db.id,
    title: db.title,
    make: db.make,
    model: db.model,
    year: db.year,
    price: db.price,
    mileage: db.mileage,
    fuelType: db.fuel_type,
    transmission: db.transmission,
    bodyType: db.body_type,
    color: db.color || "Unknown",
    engineSize: db.engine_size || "N/A",
    horsepower: db.horsepower || 0,
    doors: db.doors || 4,
    city: db.city,
    description: db.description || "",
    features: db.features || [],
    images: db.images?.length ? db.images : ["https://picsum.photos/seed/default/800/600"],
    sellerName: db.seller_name,
    sellerPhone: db.seller_phone,
    postedDate: db.created_at.split("T")[0],
  };
}

export function useListings() {
  const [dbListings, setDbListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (data) {
        setDbListings(data.map(dbToCarListing));
      }
      setLoading(false);
    }
    fetch();
  }, []);

  // DB listings first, then seed data
  const allListings = [...dbListings, ...seedListings];

  return { listings: allListings, loading };
}
