"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/car-card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { CarListing } from "@/data/cars";
import { Loader2 } from "lucide-react";

export default function MyListingsPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function fetchMyListings() {
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (data) {
        setListings(data.map((db) => ({
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
        })));
      }
      setLoading(false);
    }
    fetchMyListings();
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <span className="text-5xl block mb-4">🔒</span>
            <h1 className="text-2xl font-bold text-foreground mb-3">Sign in to view your listings</h1>
            <p className="text-muted-foreground mb-6">You need to be signed in to manage your car listings.</p>
            <Button onClick={signInWithGoogle} size="lg" className="gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign in with Google
            </Button>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
            <p className="text-muted-foreground mt-1">
              {listings.length === 0 ? "You haven't posted any cars yet." : `${listings.length} listing${listings.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">🚗</span>
              <h3 className="text-xl font-bold text-foreground mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-6">Start selling your car on DriveCY!</p>
              <a href="/sell"><Button size="lg">Post Your First Ad</Button></a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
