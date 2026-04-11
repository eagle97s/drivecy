export interface CarListing {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  engineSize: string;
  horsepower: number;
  doors: number;
  city: string;
  description: string;
  features: string[];
  images: string[];
  sellerName: string;
  sellerPhone: string;
  postedDate: string;
}

export const carMakes: Record<string, string[]> = {
  "Toyota": ["Yaris", "Corolla", "Camry", "RAV4", "C-HR", "Land Cruiser", "Hilux", "Supra", "Aygo", "Prius"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "CLA", "AMG GT", "G-Class"],
  "BMW": ["1 Series", "3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7", "M3", "M5"],
  "Audi": ["A1", "A3", "A4", "A6", "A8", "Q3", "Q5", "Q7", "Q8", "RS6"],
  "Volkswagen": ["Golf", "Polo", "Passat", "Tiguan", "T-Roc", "ID.4", "Arteon", "Touareg", "Up!", "Jetta"],
  "Honda": ["Civic", "Jazz", "CR-V", "HR-V", "Accord", "City", "Fit"],
  "Nissan": ["Qashqai", "Juke", "Micra", "X-Trail", "Leaf", "370Z", "Navara"],
  "Hyundai": ["i10", "i20", "i30", "i40", "ix20", "ix35", "Tucson", "Kona", "Santa Fe", "Ioniq 5", "Ioniq 6", "Elantra", "Accent", "Getz", "Bayon"],
  "Kia": ["Picanto", "Rio", "Ceed", "Sportage", "Sorento", "EV6", "Stinger", "Niro"],
  "Ford": ["Fiesta", "Focus", "Puma", "Kuga", "Mustang", "Ranger", "Explorer"],
  "Mazda": ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-5", "CX-30", "MX-5"],
  "Peugeot": ["208", "308", "508", "2008", "3008", "5008"],
  "Renault": ["Clio", "Megane", "Captur", "Kadjar", "Arkana", "Zoe"],
  "Volvo": ["XC40", "XC60", "XC90", "S60", "S90", "V60", "C40"],
  "Skoda": ["Fabia", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq"],
  "SEAT": ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
  "Fiat": ["500", "Panda", "Tipo", "500X", "500L"],
  "Porsche": ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
  "Land Rover": ["Range Rover", "Range Rover Sport", "Defender", "Discovery", "Evoque"],
  "Jeep": ["Wrangler", "Compass", "Renegade", "Grand Cherokee"],
  "Lexus": ["IS", "ES", "NX", "RX", "UX", "LC"],
  "Mitsubishi": ["L200", "Outlander", "Eclipse Cross", "ASX"],
  "Suzuki": ["Swift", "Vitara", "Jimny", "S-Cross", "Ignis"],
  "Citroën": ["C3", "C4", "C5 Aircross", "Berlingo"],
  "Opel": ["Corsa", "Astra", "Mokka", "Grandland", "Crossland"],
  "Tesla": ["Model 3", "Model Y", "Model S", "Model X"],
  "Mini": ["Cooper", "Countryman", "Clubman"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"],
  "Dacia": ["Sandero", "Duster", "Jogger", "Spring"],
  "Cupra": ["Leon", "Formentor", "Born", "Tavascan"],
};

export const cities = ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta", "Ayia Napa", "Paralimni", "Strovolos", "Lakatamia", "Latsia"];
export const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
export const transmissions = ["Automatic", "Manual"];
export const bodyTypes = ["Sedan", "Hatchback", "SUV", "Coupe", "Convertible", "Van", "Pickup", "Wagon"];
export const colors = ["White", "Black", "Silver", "Grey", "Blue", "Red", "Green", "Brown", "Beige", "Orange"];

const features = [
  "Air Conditioning", "Cruise Control", "Parking Sensors", "Reverse Camera",
  "Navigation", "Bluetooth", "Apple CarPlay", "Android Auto", "Leather Seats",
  "Heated Seats", "Sunroof", "Panoramic Roof", "LED Headlights", "Xenon Lights",
  "Keyless Entry", "Push Start", "Adaptive Cruise Control", "Lane Assist",
  "Blind Spot Monitor", "360° Camera", "Wireless Charging", "Premium Sound System",
  "Electric Seats", "Memory Seats", "Tinted Windows", "Alloy Wheels", "Roof Rails",
  "Sport Package", "AMG Line", "M Sport", "S Line"
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createListings() {
  const rng = seededRandom(42);
  const r = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
  const rr = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

  const allMakes = Object.keys(carMakes);

  return Array.from({ length: 60 }, (_, i) => {
    const make = r(allMakes);
    const model = r(carMakes[make]);
    const year = rr(2005, 2026);
    const isNew = year >= 2023;
    const mileage = isNew ? rr(0, 30000) : rr(20000, 250000);
    const basePrice = isNew ? rr(15000, 85000) : rr(3000, 35000);
    const fuelType = r(fuelTypes);
    const transmission = r(transmissions);
    const bodyType = r(bodyTypes);
    const color = r(colors);
    const city = r(cities);
    const engineSize = fuelType === "Electric" ? "N/A" : `${(rr(10, 40) / 10).toFixed(1)}L`;
    const horsepower = fuelType === "Electric" ? rr(150, 500) : rr(75, 400);
    const featureCount = rr(4, 10);
    const shuffled = [...features].sort(() => rng() - 0.5);

    const listing: CarListing = {
      id: `car-${(i + 1).toString().padStart(4, "0")}`,
      title: `${year} ${make} ${model}`,
      make,
      model,
      year,
      price: Math.round(basePrice / 100) * 100,
      mileage,
      fuelType,
      transmission,
      bodyType,
      color,
      engineSize,
      horsepower,
      doors: r([2, 3, 4, 5]),
      city,
      description: `Beautiful ${year} ${make} ${model} in ${color.toLowerCase()}. ${isNew ? "Like new condition with" : "Well maintained with"} ${mileage.toLocaleString()} km. ${fuelType} engine, ${transmission.toLowerCase()} transmission. Located in ${city}, Cyprus. ${r(["Must see!", "Great deal!", "Price negotiable.", "Serious buyers only.", "First owner.", "Full service history.", "Recently serviced."])}`,
      features: shuffled.slice(0, featureCount),
      images: Array.from({ length: rr(3, 6) }, (_, j) => `https://picsum.photos/seed/${i + 1}-${j}/800/600`),
      sellerName: r(["Andreas K.", "Maria P.", "Nikos C.", "Elena D.", "Costas M.", "Anna S.", "Yiannis L.", "Sophia T.", "Petros G.", "Christina V."]),
      sellerPhone: `+357 9${rr(1, 9)}${rr(100000, 999999)}`,
      postedDate: `2026-0${rr(1, 4)}-${rr(1, 28).toString().padStart(2, "0")}`,
    };
    return listing;
  });
}

export const listings: CarListing[] = createListings();
