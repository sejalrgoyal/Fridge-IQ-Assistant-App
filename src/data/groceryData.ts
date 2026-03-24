// Address suggestions covering all 50 US states
const allAddresses: { query: string[]; address: string; state: string }[] = [
  // Alabama
  { query: ['alabama', 'birmingham', 'al'], address: '2000 Riverchase Galleria, Birmingham, AL 35244', state: 'AL' },
  { query: ['montgomery', 'al'], address: '7100 East Chase Pkwy, Montgomery, AL 36117', state: 'AL' },
  // Alaska
  { query: ['alaska', 'anchorage', 'ak'], address: '320 W 5th Ave, Anchorage, AK 99501', state: 'AK' },
  // Arizona
  { query: ['arizona', 'phoenix', 'az', 'scottsdale'], address: '2402 E Camelback Rd, Phoenix, AZ 85016', state: 'AZ' },
  { query: ['tucson', 'az'], address: '4500 N Oracle Rd, Tucson, AZ 85705', state: 'AZ' },
  // Arkansas
  { query: ['arkansas', 'little rock', 'ar'], address: '11500 Financial Centre Pkwy, Little Rock, AR 72211', state: 'AR' },
  // California
  { query: ['san francisco', 'sf', 'ca'], address: '555 California St, San Francisco, CA 94104', state: 'CA' },
  { query: ['san francisco', 'sf', 'mission'], address: '2000 Mission St, San Francisco, CA 94110', state: 'CA' },
  { query: ['los angeles', 'la', 'ca'], address: '6350 W 3rd St, Los Angeles, CA 90036', state: 'CA' },
  { query: ['san diego', 'ca'], address: '1640 Camino Del Rio N, San Diego, CA 92108', state: 'CA' },
  { query: ['sacramento', 'ca'], address: '1820 Capitol Ave, Sacramento, CA 95811', state: 'CA' },
  // Colorado
  { query: ['colorado', 'denver', 'co'], address: '900 Auraria Pkwy, Denver, CO 80204', state: 'CO' },
  { query: ['boulder', 'co'], address: '2905 Pearl St, Boulder, CO 80301', state: 'CO' },
  // Connecticut
  { query: ['connecticut', 'hartford', 'ct'], address: '100 Columbus Blvd, Hartford, CT 06103', state: 'CT' },
  { query: ['stamford', 'ct'], address: '230 Atlantic St, Stamford, CT 06901', state: 'CT' },
  // Delaware
  { query: ['delaware', 'wilmington', 'de'], address: '4737 Concord Pike, Wilmington, DE 19803', state: 'DE' },
  // Florida
  { query: ['florida', 'miami', 'fl'], address: '600 Brickell Ave, Miami, FL 33131', state: 'FL' },
  { query: ['orlando', 'fl'], address: '4200 Conroy Rd, Orlando, FL 32839', state: 'FL' },
  { query: ['tampa', 'fl'], address: '2223 N Dale Mabry Hwy, Tampa, FL 33607', state: 'FL' },
  { query: ['jacksonville', 'fl'], address: '4413 Town Center Pkwy, Jacksonville, FL 32246', state: 'FL' },
  // Georgia
  { query: ['georgia', 'atlanta', 'ga'], address: '3393 Peachtree Rd NE, Atlanta, GA 30326', state: 'GA' },
  { query: ['savannah', 'ga'], address: '311 W Broughton St, Savannah, GA 31401', state: 'GA' },
  // Hawaii
  { query: ['hawaii', 'honolulu', 'hi'], address: '1450 Ala Moana Blvd, Honolulu, HI 96814', state: 'HI' },
  // Idaho
  { query: ['idaho', 'boise', 'id'], address: '350 N Milwaukee St, Boise, ID 83704', state: 'ID' },
  // Illinois
  { query: ['illinois', 'chicago', 'il'], address: '750 N Michigan Ave, Chicago, IL 60611', state: 'IL' },
  { query: ['chicago', 'wabash'], address: '900 S Wabash Ave, Chicago, IL 60605', state: 'IL' },
  // Indiana
  { query: ['indiana', 'indianapolis', 'in'], address: '1300 S Meridian St, Indianapolis, IN 46225', state: 'IN' },
  // Iowa
  { query: ['iowa', 'des moines', 'ia'], address: '101 Jordan Creek Pkwy, Des Moines, IA 50266', state: 'IA' },
  // Kansas
  { query: ['kansas', 'wichita', 'ks'], address: '2000 N Rock Rd, Wichita, KS 67206', state: 'KS' },
  { query: ['kansas city', 'ks'], address: '10500 Metcalf Ave, Overland Park, KS 66212', state: 'KS' },
  // Kentucky
  { query: ['kentucky', 'louisville', 'ky'], address: '2020 Brownsboro Rd, Louisville, KY 40206', state: 'KY' },
  // Louisiana
  { query: ['louisiana', 'new orleans', 'la'], address: '3420 Veterans Memorial Blvd, Metairie, LA 70002', state: 'LA' },
  { query: ['baton rouge', 'la'], address: '7529 Corporate Blvd, Baton Rouge, LA 70809', state: 'LA' },
  // Maine
  { query: ['maine', 'portland', 'me'], address: '180 Waterman Dr, South Portland, ME 04106', state: 'ME' },
  // Maryland
  { query: ['maryland', 'baltimore', 'md'], address: '1000 E Pratt St, Baltimore, MD 21202', state: 'MD' },
  { query: ['bethesda', 'md'], address: '5270 River Rd, Bethesda, MD 20816', state: 'MD' },
  // Massachusetts
  { query: ['massachusetts', 'boston', 'ma'], address: '800 Boylston St, Boston, MA 02199', state: 'MA' },
  { query: ['cambridge', 'ma'], address: '340 River St, Cambridge, MA 02139', state: 'MA' },
  // Michigan
  { query: ['michigan', 'detroit', 'mi'], address: '3300 Greenfield Rd, Dearborn, MI 48120', state: 'MI' },
  { query: ['ann arbor', 'mi'], address: '3135 Washtenaw Ave, Ann Arbor, MI 48104', state: 'MI' },
  // Minnesota
  { query: ['minnesota', 'minneapolis', 'mn'], address: '1500 Nicollet Mall, Minneapolis, MN 55403', state: 'MN' },
  { query: ['st paul', 'mn'], address: '484 Lexington Pkwy N, St Paul, MN 55104', state: 'MN' },
  // Mississippi
  { query: ['mississippi', 'jackson', 'ms'], address: '1000 Highland Colony Pkwy, Ridgeland, MS 39157', state: 'MS' },
  // Missouri
  { query: ['missouri', 'st louis', 'mo'], address: '1601 S Brentwood Blvd, St. Louis, MO 63144', state: 'MO' },
  { query: ['kansas city', 'mo'], address: '8600 Ward Pkwy, Kansas City, MO 64114', state: 'MO' },
  // Montana
  { query: ['montana', 'billings', 'mt'], address: '2465 Central Ave, Billings, MT 59102', state: 'MT' },
  // Nebraska
  { query: ['nebraska', 'omaha', 'ne'], address: '10225 Pacific St, Omaha, NE 68114', state: 'NE' },
  // Nevada
  { query: ['nevada', 'las vegas', 'nv'], address: '3500 Las Vegas Blvd, Las Vegas, NV 89109', state: 'NV' },
  { query: ['reno', 'nv'], address: '5065 S McCarran Blvd, Reno, NV 89502', state: 'NV' },
  // New Hampshire
  { query: ['new hampshire', 'manchester', 'nh'], address: '101 S River Rd, Bedford, NH 03110', state: 'NH' },
  // New Jersey
  { query: ['new jersey', 'newark', 'nj'], address: '240 E Houston St, Newark, NJ 07105', state: 'NJ' },
  { query: ['jersey city', 'nj'], address: '125 18th St, Jersey City, NJ 07310', state: 'NJ' },
  // New Mexico
  { query: ['new mexico', 'albuquerque', 'nm'], address: '2240 Q St NE, Albuquerque, NM 87110', state: 'NM' },
  // New York
  { query: ['new york', 'nyc', 'ny', 'manhattan'], address: '4 Union Square S, New York, NY 10003', state: 'NY' },
  { query: ['new york', 'broadway'], address: '1450 Broadway, New York, NY 10018', state: 'NY' },
  { query: ['brooklyn', 'ny'], address: '214 3rd St, Brooklyn, NY 11215', state: 'NY' },
  { query: ['queens', 'ny'], address: '77-55 31st Ave, Queens, NY 11370', state: 'NY' },
  // North Carolina
  { query: ['north carolina', 'charlotte', 'nc'], address: '6901 Northlake Mall Dr, Charlotte, NC 28216', state: 'NC' },
  { query: ['raleigh', 'nc'], address: '3551 Sumner Blvd, Raleigh, NC 27616', state: 'NC' },
  // North Dakota
  { query: ['north dakota', 'fargo', 'nd'], address: '4475 15th Ave S, Fargo, ND 58103', state: 'ND' },
  // Ohio
  { query: ['ohio', 'columbus', 'oh'], address: '3900 Morse Crossing, Columbus, OH 43219', state: 'OH' },
  { query: ['cleveland', 'oh'], address: '20060 Detroit Rd, Rocky River, OH 44116', state: 'OH' },
  // Oklahoma
  { query: ['oklahoma', 'oklahoma city', 'ok'], address: '2501 W Memorial Rd, Oklahoma City, OK 73134', state: 'OK' },
  // Oregon
  { query: ['oregon', 'portland', 'or'], address: '2825 E Burnside St, Portland, OR 97214', state: 'OR' },
  { query: ['eugene', 'or'], address: '353 E Broadway, Eugene, OR 97401', state: 'OR' },
  // Pennsylvania
  { query: ['pennsylvania', 'philadelphia', 'pa'], address: '2101 Pennsylvania Ave, Philadelphia, PA 19130', state: 'PA' },
  { query: ['pittsburgh', 'pa'], address: '5550 Centre Ave, Pittsburgh, PA 15232', state: 'PA' },
  // Rhode Island
  { query: ['rhode island', 'providence', 'ri'], address: '261 Waterman St, Providence, RI 02906', state: 'RI' },
  // South Carolina
  { query: ['south carolina', 'charleston', 'sc'], address: '1401 Sam Rittenberg Blvd, Charleston, SC 29407', state: 'SC' },
  // South Dakota
  { query: ['south dakota', 'sioux falls', 'sd'], address: '2500 W 49th St, Sioux Falls, SD 57105', state: 'SD' },
  // Tennessee
  { query: ['tennessee', 'nashville', 'tn'], address: '4500 Harding Pike, Nashville, TN 37205', state: 'TN' },
  { query: ['memphis', 'tn'], address: '1620 Getwell Rd, Memphis, TN 38111', state: 'TN' },
  // Texas
  { query: ['texas', 'houston', 'tx'], address: '4323 San Felipe St, Houston, TX 77027', state: 'TX' },
  { query: ['dallas', 'tx'], address: '4100 Lomo Alto Dr, Dallas, TX 75219', state: 'TX' },
  { query: ['austin', 'tx'], address: '525 N Lamar Blvd, Austin, TX 78703', state: 'TX' },
  { query: ['san antonio', 'tx'], address: '255 E Basse Rd, San Antonio, TX 78209', state: 'TX' },
  // Utah
  { query: ['utah', 'salt lake', 'ut'], address: '702 E 400 S, Salt Lake City, UT 84102', state: 'UT' },
  // Vermont
  { query: ['vermont', 'burlington', 'vt'], address: '207 Flynn Ave, Burlington, VT 05401', state: 'VT' },
  // Virginia
  { query: ['virginia', 'richmond', 'va'], address: '1301 N Hamilton St, Richmond, VA 23230', state: 'VA' },
  { query: ['arlington', 'va'], address: '2700 Clarendon Blvd, Arlington, VA 22201', state: 'VA' },
  // Washington
  { query: ['washington', 'seattle', 'wa'], address: '2210 Westlake Ave, Seattle, WA 98121', state: 'WA' },
  { query: ['bellevue', 'wa'], address: '888 116th Ave NE, Bellevue, WA 98004', state: 'WA' },
  // Washington DC
  { query: ['dc', 'washington dc'], address: '660 N Capitol St, Washington, DC 20001', state: 'DC' },
  { query: ['dc', 'washington dc', 'pennsylvania'], address: '950 Pennsylvania Ave, Washington, DC 20004', state: 'DC' },
  // West Virginia
  { query: ['west virginia', 'charleston', 'wv'], address: '900 Quarrier St, Charleston, WV 25301', state: 'WV' },
  // Wisconsin
  { query: ['wisconsin', 'milwaukee', 'wi'], address: '2201 N MLK Dr, Milwaukee, WI 53212', state: 'WI' },
  { query: ['madison', 'wi'], address: '3312 University Ave, Madison, WI 53705', state: 'WI' },
  // Wyoming
  { query: ['wyoming', 'cheyenne', 'wy'], address: '1400 Dell Range Blvd, Cheyenne, WY 82009', state: 'WY' },
];

export function getAddressSuggestions(query: string): string[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();
  const results = new Set<string>();

  for (const entry of allAddresses) {
    // Match by query keywords
    for (const kw of entry.query) {
      if (q.includes(kw) || kw.includes(q)) {
        results.add(entry.address);
        break;
      }
    }
    // Also fuzzy match on the address itself
    if (entry.address.toLowerCase().includes(q)) {
      results.add(entry.address);
    }
  }

  return [...results].slice(0, 6);
}

// ─── Store & Aisle Data ───

export interface StoreAisleMap {
  [product: string]: { aisle: string; section: string };
}

export interface NearbyStore {
  id: string;
  name: string;
  distance: string;
  address: string;
  priceMultiplier: number;
  logo: string;
  aisleMap: StoreAisleMap;
}

// Realistic aisle layouts per store chain
const wholeFoodsAisles: StoreAisleMap = {
  'Soy Sauce': { aisle: 'Aisle 5', section: 'Asian & International' },
  'Bread (Whole Wheat)': { aisle: 'Aisle 1', section: 'Bakery' },
  'Lemon': { aisle: 'Aisle 2', section: 'Fresh Produce' },
  'Olive Oil': { aisle: 'Aisle 5', section: 'Oils & Vinegars' },
  'Honey': { aisle: 'Aisle 6', section: 'Sweeteners & Spreads' },
  'Granola': { aisle: 'Aisle 7', section: 'Breakfast & Cereal' },
  'Milk': { aisle: 'Aisle 10', section: 'Dairy & Refrigerated' },
  'Spinach': { aisle: 'Aisle 2', section: 'Fresh Produce' },
};

const traderJoesAisles: StoreAisleMap = {
  'Soy Sauce': { aisle: 'Aisle 3', section: 'Condiments & Sauces' },
  'Bread (Whole Wheat)': { aisle: 'Front Display', section: 'Bakery' },
  'Lemon': { aisle: 'Aisle 1', section: 'Produce' },
  'Olive Oil': { aisle: 'Aisle 3', section: 'Oils & Cooking' },
  'Honey': { aisle: 'Aisle 4', section: 'Spreads & Jams' },
  'Granola': { aisle: 'Aisle 5', section: 'Breakfast' },
  'Milk': { aisle: 'Aisle 8', section: 'Dairy' },
  'Spinach': { aisle: 'Aisle 1', section: 'Produce' },
};

const walmartAisles: StoreAisleMap = {
  'Soy Sauce': { aisle: 'Aisle 7', section: 'International Foods' },
  'Bread (Whole Wheat)': { aisle: 'Aisle 2', section: 'Bread & Bakery' },
  'Lemon': { aisle: 'Aisle 1', section: 'Fresh Produce' },
  'Olive Oil': { aisle: 'Aisle 7', section: 'Oils & Dressings' },
  'Honey': { aisle: 'Aisle 9', section: 'Baking & Sweeteners' },
  'Granola': { aisle: 'Aisle 10', section: 'Breakfast & Cereal' },
  'Milk': { aisle: 'Aisle 14', section: 'Dairy & Eggs' },
  'Spinach': { aisle: 'Aisle 1', section: 'Fresh Produce' },
};

const costcoAisles: StoreAisleMap = {
  'Soy Sauce': { aisle: 'Aisle 3', section: 'Pantry & Condiments' },
  'Bread (Whole Wheat)': { aisle: 'Back Wall', section: 'Bakery' },
  'Lemon': { aisle: 'Front Entrance', section: 'Produce' },
  'Olive Oil': { aisle: 'Aisle 3', section: 'Oils & Cooking' },
  'Honey': { aisle: 'Aisle 4', section: 'Baking Supplies' },
  'Granola': { aisle: 'Aisle 6', section: 'Snacks & Breakfast' },
  'Milk': { aisle: 'Back Wall', section: 'Dairy & Cold' },
  'Spinach': { aisle: 'Front Entrance', section: 'Produce' },
};

const aldiAisles: StoreAisleMap = {
  'Soy Sauce': { aisle: 'Aisle 2', section: 'Sauces & Condiments' },
  'Bread (Whole Wheat)': { aisle: 'Aisle 1', section: 'Bakery' },
  'Lemon': { aisle: 'Front Display', section: 'Fresh Produce' },
  'Olive Oil': { aisle: 'Aisle 2', section: 'Cooking Oils' },
  'Honey': { aisle: 'Aisle 3', section: 'Spreads' },
  'Granola': { aisle: 'Aisle 3', section: 'Breakfast' },
  'Milk': { aisle: 'Aisle 5', section: 'Refrigerated' },
  'Spinach': { aisle: 'Front Display', section: 'Fresh Produce' },
};

const krogerAisles: StoreAisleMap = {
  'Soy Sauce': { aisle: 'Aisle 6', section: 'Asian Foods' },
  'Bread (Whole Wheat)': { aisle: 'Aisle 1', section: 'Bakery & Bread' },
  'Lemon': { aisle: 'Produce Section', section: 'Fresh Fruits' },
  'Olive Oil': { aisle: 'Aisle 6', section: 'Oils & Vinegars' },
  'Honey': { aisle: 'Aisle 8', section: 'Baking' },
  'Granola': { aisle: 'Aisle 9', section: 'Cereal & Breakfast' },
  'Milk': { aisle: 'Aisle 12', section: 'Dairy' },
  'Spinach': { aisle: 'Produce Section', section: 'Fresh Vegetables' },
};

const targetAisles: StoreAisleMap = {
  'Soy Sauce': { aisle: 'Aisle A4', section: 'International & Sauces' },
  'Bread (Whole Wheat)': { aisle: 'Aisle A1', section: 'Grocery — Bakery' },
  'Lemon': { aisle: 'Aisle A1', section: 'Grocery — Produce' },
  'Olive Oil': { aisle: 'Aisle A4', section: 'Grocery — Cooking' },
  'Honey': { aisle: 'Aisle A5', section: 'Grocery — Baking' },
  'Granola': { aisle: 'Aisle A6', section: 'Grocery — Breakfast' },
  'Milk': { aisle: 'Aisle A8', section: 'Grocery — Dairy' },
  'Spinach': { aisle: 'Aisle A1', section: 'Grocery — Produce' },
};

const publixAisles: StoreAisleMap = {
  'Soy Sauce': { aisle: 'Aisle 5', section: 'International' },
  'Bread (Whole Wheat)': { aisle: 'Bakery', section: 'Bread Wall' },
  'Lemon': { aisle: 'Produce', section: 'Citrus' },
  'Olive Oil': { aisle: 'Aisle 5', section: 'Oils & Dressings' },
  'Honey': { aisle: 'Aisle 7', section: 'Jams & Spreads' },
  'Granola': { aisle: 'Aisle 8', section: 'Cereal' },
  'Milk': { aisle: 'Dairy Wall', section: 'Milk & Cream' },
  'Spinach': { aisle: 'Produce', section: 'Leafy Greens' },
};

const hEBAisles: StoreAisleMap = {
  'Soy Sauce': { aisle: 'Aisle 4', section: 'Global Foods' },
  'Bread (Whole Wheat)': { aisle: 'Aisle 1', section: 'Bakery' },
  'Lemon': { aisle: 'Produce', section: 'Fresh Citrus' },
  'Olive Oil': { aisle: 'Aisle 4', section: 'Cooking Oils' },
  'Honey': { aisle: 'Aisle 6', section: 'Spreads & Syrups' },
  'Granola': { aisle: 'Aisle 7', section: 'Breakfast' },
  'Milk': { aisle: 'Dairy Wall', section: 'Milk' },
  'Spinach': { aisle: 'Produce', section: 'Fresh Greens' },
};

// State → store chains available (with realistic regional presence)
interface StoreTemplate {
  chain: string;
  logo: string;
  priceMultiplier: number;
  aisleMap: StoreAisleMap;
}

const storeChains: Record<string, StoreTemplate> = {
  'Whole Foods': { chain: 'Whole Foods Market', logo: '🏪', priceMultiplier: 1.0, aisleMap: wholeFoodsAisles },
  "Trader Joe's": { chain: "Trader Joe's", logo: '🛒', priceMultiplier: 0.82, aisleMap: traderJoesAisles },
  'Walmart': { chain: 'Walmart Supercenter', logo: '🏬', priceMultiplier: 0.65, aisleMap: walmartAisles },
  'Costco': { chain: 'Costco Wholesale', logo: '📦', priceMultiplier: 0.55, aisleMap: costcoAisles },
  'ALDI': { chain: 'ALDI', logo: '🛍️', priceMultiplier: 0.60, aisleMap: aldiAisles },
  'Kroger': { chain: 'Kroger', logo: '🟦', priceMultiplier: 0.72, aisleMap: krogerAisles },
  'Target': { chain: 'Target', logo: '🎯', priceMultiplier: 0.78, aisleMap: targetAisles },
  'Publix': { chain: 'Publix', logo: '🟢', priceMultiplier: 0.85, aisleMap: publixAisles },
  'H-E-B': { chain: 'H-E-B', logo: '🔴', priceMultiplier: 0.70, aisleMap: hEBAisles },
};

// Which chains are present per state (realistic regional coverage)
const stateStores: Record<string, string[]> = {
  AL: ['Walmart', 'Kroger', 'ALDI', 'Publix', 'Costco'],
  AK: ['Walmart', 'Costco', 'Target'],
  AZ: ['Walmart', 'Costco', 'Target', "Trader Joe's", 'Whole Foods', 'Kroger'],
  AR: ['Walmart', 'Kroger', 'Target'],
  CA: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI', 'Kroger'],
  CO: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'Kroger'],
  CT: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI'],
  DE: ['Whole Foods', 'Walmart', 'Target', 'ALDI'],
  DC: ['Whole Foods', "Trader Joe's", 'Target', 'Costco'],
  FL: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI', 'Publix'],
  GA: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI', 'Kroger', 'Publix'],
  HI: ['Whole Foods', 'Costco', 'Target', 'Walmart'],
  ID: ['Walmart', 'Costco', "Trader Joe's", 'Target'],
  IL: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI', 'Kroger'],
  IN: ['Walmart', 'Costco', 'Target', 'ALDI', 'Kroger', "Trader Joe's"],
  IA: ['Walmart', 'Costco', 'Target', 'ALDI'],
  KS: ['Walmart', 'Costco', 'Target', 'ALDI', 'Kroger'],
  KY: ['Walmart', 'Costco', 'Target', 'ALDI', 'Kroger'],
  LA: ['Walmart', 'Costco', 'Target', 'Whole Foods'],
  ME: ['Walmart', "Trader Joe's", 'Target', 'Whole Foods'],
  MD: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI'],
  MA: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI'],
  MI: ['Walmart', 'Costco', 'Target', 'ALDI', 'Kroger', "Trader Joe's", 'Whole Foods'],
  MN: ['Walmart', 'Costco', 'Target', 'ALDI', "Trader Joe's", 'Whole Foods'],
  MS: ['Walmart', 'Kroger', 'Target'],
  MO: ['Walmart', 'Costco', 'Target', 'ALDI', "Trader Joe's", 'Whole Foods'],
  MT: ['Walmart', 'Costco', 'Target'],
  NE: ['Walmart', 'Costco', 'Target', 'ALDI', "Trader Joe's"],
  NV: ['Walmart', 'Costco', 'Target', "Trader Joe's", 'Whole Foods'],
  NH: ['Walmart', "Trader Joe's", 'Target', 'Whole Foods', 'ALDI'],
  NJ: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI'],
  NM: ['Walmart', 'Costco', 'Target', "Trader Joe's"],
  NY: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI'],
  NC: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI', 'Publix'],
  ND: ['Walmart', 'Target'],
  OH: ['Walmart', 'Costco', 'Target', 'ALDI', 'Kroger', "Trader Joe's", 'Whole Foods'],
  OK: ['Walmart', 'Costco', 'Target', 'ALDI'],
  OR: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target'],
  PA: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI'],
  RI: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI'],
  SC: ['Walmart', 'Costco', 'Target', 'ALDI', 'Publix'],
  SD: ['Walmart', 'Target'],
  TN: ['Walmart', 'Costco', 'Target', 'ALDI', 'Kroger', "Trader Joe's", 'Whole Foods', 'Publix'],
  TX: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI', 'Kroger', 'H-E-B'],
  UT: ['Walmart', 'Costco', 'Target', "Trader Joe's", 'Whole Foods'],
  VT: ['Walmart', "Trader Joe's", 'Target'],
  VA: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target', 'ALDI'],
  WA: ['Whole Foods', "Trader Joe's", 'Walmart', 'Costco', 'Target'],
  WV: ['Walmart', 'Kroger', 'Target', 'ALDI'],
  WI: ['Walmart', 'Costco', 'Target', 'ALDI', "Trader Joe's"],
  WY: ['Walmart', 'Target'],
};

function getStateFromAddress(address: string): string {
  const lower = address.toLowerCase();

  // Check state abbreviations at the end of address
  const stateMatch = address.match(/,\s*([A-Z]{2})\s+\d{5}/);
  if (stateMatch && stateStores[stateMatch[1]]) return stateMatch[1];

  // Check state names
  const stateNames: Record<string, string> = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH',
    'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC',
    'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA',
    'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD', 'tennessee': 'TN',
    'texas': 'TX', 'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
    'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  };

  // City to state mapping for popular cities
  const cityToState: Record<string, string> = {
    'birmingham': 'AL', 'anchorage': 'AK', 'phoenix': 'AZ', 'scottsdale': 'AZ', 'tucson': 'AZ',
    'little rock': 'AR', 'san francisco': 'CA', 'los angeles': 'CA', 'san diego': 'CA', 'sacramento': 'CA',
    'denver': 'CO', 'boulder': 'CO', 'hartford': 'CT', 'stamford': 'CT', 'wilmington': 'DE',
    'miami': 'FL', 'orlando': 'FL', 'tampa': 'FL', 'jacksonville': 'FL', 'atlanta': 'GA',
    'savannah': 'GA', 'honolulu': 'HI', 'boise': 'ID', 'chicago': 'IL', 'indianapolis': 'IN',
    'des moines': 'IA', 'wichita': 'KS', 'louisville': 'KY', 'new orleans': 'LA', 'metairie': 'LA',
    'baton rouge': 'LA', 'portland': 'OR', 'south portland': 'ME', 'baltimore': 'MD', 'bethesda': 'MD',
    'boston': 'MA', 'cambridge': 'MA', 'detroit': 'MI', 'dearborn': 'MI', 'ann arbor': 'MI',
    'minneapolis': 'MN', 'st paul': 'MN', 'jackson': 'MS', 'ridgeland': 'MS', 'st. louis': 'MO',
    'st louis': 'MO', 'kansas city': 'MO', 'billings': 'MT', 'omaha': 'NE', 'las vegas': 'NV',
    'reno': 'NV', 'manchester': 'NH', 'bedford': 'NH', 'newark': 'NJ', 'jersey city': 'NJ',
    'albuquerque': 'NM', 'new york': 'NY', 'brooklyn': 'NY', 'queens': 'NY', 'manhattan': 'NY',
    'charlotte': 'NC', 'raleigh': 'NC', 'fargo': 'ND', 'columbus': 'OH', 'cleveland': 'OH',
    'rocky river': 'OH', 'oklahoma city': 'OK', 'eugene': 'OR', 'philadelphia': 'PA',
    'pittsburgh': 'PA', 'providence': 'RI', 'charleston': 'SC', 'sioux falls': 'SD',
    'nashville': 'TN', 'memphis': 'TN', 'houston': 'TX', 'dallas': 'TX', 'austin': 'TX',
    'san antonio': 'TX', 'salt lake': 'UT', 'burlington': 'VT', 'richmond': 'VA', 'arlington': 'VA',
    'seattle': 'WA', 'bellevue': 'WA', 'milwaukee': 'WI', 'madison': 'WI', 'cheyenne': 'WY',
    'overland park': 'KS',
  };

  for (const [name, code] of Object.entries(stateNames)) {
    if (lower.includes(name)) return code;
  }
  for (const [city, code] of Object.entries(cityToState)) {
    if (lower.includes(city)) return code;
  }
  // Check 2-letter state codes in address
  for (const code of Object.keys(stateStores)) {
    if (address.includes(`, ${code} `) || address.endsWith(`, ${code}`)) return code;
  }

  return 'CA'; // Default fallback
}

export function getStoresForAddress(address: string): NearbyStore[] {
  const state = getStateFromAddress(address);
  const chains = stateStores[state] || stateStores['CA'];

  // Generate realistic distances
  const distances = [0.2, 0.5, 0.8, 1.3, 1.9, 2.4, 3.1, 3.8];

  // Get city from address for store addresses
  const cityMatch = address.match(/,\s*([^,]+),\s*[A-Z]{2}/);
  const city = cityMatch ? cityMatch[1].trim() : 'Local Area';

  return chains.map((chainKey, i) => {
    const template = storeChains[chainKey];
    return {
      id: `${chainKey.toLowerCase().replace(/[^a-z]/g, '')}-${state.toLowerCase()}-${i}`,
      name: template.chain,
      distance: `${distances[i % distances.length]} mi`,
      address: `${Math.floor(Math.random() * 9000 + 1000)} ${['Main St', 'Oak Ave', 'Market Blvd', 'Center Dr', 'Commerce Way', 'Retail Pkwy'][i % 6]}, ${city}`,
      priceMultiplier: template.priceMultiplier,
      logo: template.logo,
      aisleMap: template.aisleMap,
    };
  }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

export function getAisleInfo(store: NearbyStore, productName: string): { aisle: string; section: string } {
  return store.aisleMap[productName] || { aisle: 'Ask Staff', section: 'General' };
}

export function getAisleInfoByChain(chainName: string, productName: string): { aisle: string; section: string } {
  // Try to match chain name to known store chains
  const lower = chainName.toLowerCase();
  for (const [key, template] of Object.entries(storeChains)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return template.aisleMap[productName] || { aisle: 'Ask Staff', section: 'General' };
    }
  }
  // Default: use Walmart aisle layout as generic fallback
  return walmartAisles[productName] || { aisle: 'Ask Staff', section: 'General' };
}
