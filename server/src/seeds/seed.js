import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, MenuItem, CafeTable } from '../models/index.js';
import { config } from '../config/env.js';

dotenv.config();

// ⚠️  DEVELOPMENT / DEMO USE ONLY — These are throwaway credentials for local testing.
//    Never use these values in a staging or production environment.
//    Production admins must be created via a separate secure provisioning process.
const sampleUsers = [
  {
    name: 'Verdora Administrator',
    email: 'admin@verdora.local',
    plainPassword: 'AdminSecurePass123!',
    role: 'admin',
  },
  {
    name: 'Nuwan Perera',
    email: 'customer@verdora.local',
    plainPassword: 'CustomerPass123!',
    role: 'customer',
  },
];

const sampleTables = [
  { tableNumber: 'T-01', capacity: 2, isActive: true },
  { tableNumber: 'T-02', capacity: 2, isActive: true },
  { tableNumber: 'T-03', capacity: 4, isActive: true },
  { tableNumber: 'T-04', capacity: 4, isActive: true },
  { tableNumber: 'T-05', capacity: 4, isActive: true },
  { tableNumber: 'T-06', capacity: 6, isActive: true },
  { tableNumber: 'T-07', capacity: 6, isActive: true },
  { tableNumber: 'T-08', capacity: 8, isActive: true },
];

const sampleMenuItems = [
  {
    name: 'Amazonian Açai Super-Bowl',
    description: 'Pure organic açai purée topped with activated granola, banana, chia seeds, and raw honeycomb.',
    category: 'Bowls',
    price: 1850,
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Organic Açai', 'Banana', 'Granola', 'Chia Seeds', 'Honey'],
    allergens: ['Nuts', 'Gluten'],
    calories: 380,
    isAvailable: true,
  },
  {
    name: 'Green Goddess Glow Juice',
    description: 'Cold-pressed English cucumber, organic celery, granny smith apple, baby spinach, and fresh ginger.',
    category: 'Juices',
    price: 950,
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Cucumber', 'Celery', 'Green Apple', 'Spinach', 'Ginger'],
    allergens: [],
    calories: 120,
    isAvailable: true,
  },
  {
    name: 'Artisan Avocado Sourdough Toast',
    description: 'Crushed Hass avocado on toasted whole-grain sourdough with heirloom cherry tomatoes, dukkah, and chili flakes.',
    category: 'Toast',
    price: 1450,
    imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Whole Wheat Sourdough', 'Hass Avocado', 'Cherry Tomatoes', 'Dukkah', 'Olive Oil'],
    allergens: ['Gluten', 'Sesame'],
    calories: 320,
    isAvailable: true,
  },
  {
    name: 'Golden Turmeric Sunshine Elixir',
    description: 'Organic raw turmeric, ginger, valencia orange, and black pepper cold-pressed wellness shot.',
    category: 'Juices',
    price: 650,
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Turmeric', 'Orange', 'Ginger', 'Black Pepper'],
    allergens: [],
    calories: 75,
    isAvailable: true,
  },
  {
    name: 'Matcha Oat Latte',
    description: 'Ceremonial grade Japanese Uji matcha whisked with velvety steamed organic oat milk and blue agave.',
    category: 'Beverages',
    price: 850,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Ceremonial Matcha', 'Oat Milk', 'Agave Nectar'],
    allergens: ['Oats'],
    calories: 140,
    isAvailable: true,
  },
  {
    name: 'Rainbow Quinoa Protein Bowl',
    description: 'Tri-color Andean quinoa, steamed edamame, roasted sweet potato cubes, shredded beetroot, and tahini drizzle.',
    category: 'Bowls',
    price: 1950,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Quinoa', 'Edamame', 'Sweet Potato', 'Beetroot', 'Tahini'],
    allergens: ['Soy', 'Sesame'],
    calories: 450,
    isAvailable: true,
  },
  {
    name: 'Raw Energy Protein Bites (3 pcs)',
    description: 'Medjool dates, raw cacao powder, crushed almonds, and organic chia seed rolled balls.',
    category: 'Snacks',
    price: 600,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Medjool Dates', 'Cacao', 'Almonds', 'Chia'],
    allergens: ['Nuts'],
    calories: 210,
    isAvailable: true,
  },
  {
    name: 'Wild Berry Chia Pudding',
    description: 'Chia seeds soaked in unsweetened almond milk layered with raspberry compote and fresh blueberries.',
    category: 'Bowls',
    price: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80',
    ingredients: ['Chia Seeds', 'Almond Milk', 'Blueberries', 'Raspberries'],
    allergens: ['Nuts'],
    calories: 260,
    isAvailable: true,
  },
];

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected.');

    // 1. Seed Users safely
    console.log('[Seed] Seeding users...');
    for (const u of sampleUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        const passwordHash = await User.hashPassword(u.plainPassword);
        await User.create({
          name: u.name,
          email: u.email,
          passwordHash,
          role: u.role,
        });
        console.log(`  + Created user: ${u.email} (${u.role})`);
      } else {
        console.log(`  ~ User already exists: ${u.email}`);
      }
    }

    // 2. Seed Tables safely
    console.log('[Seed] Seeding cafe tables...');
    for (const t of sampleTables) {
      const existing = await CafeTable.findOne({ tableNumber: t.tableNumber });
      if (!existing) {
        await CafeTable.create(t);
        console.log(`  + Created table: ${t.tableNumber} (Cap: ${t.capacity})`);
      } else {
        console.log(`  ~ Table already exists: ${t.tableNumber}`);
      }
    }

    // 3. Seed Menu Items safely
    console.log('[Seed] Seeding menu items...');
    for (const item of sampleMenuItems) {
      const existing = await MenuItem.findOne({ name: item.name });
      if (!existing) {
        await MenuItem.create(item);
        console.log(`  + Created menu item: ${item.name} (${item.category})`);
      } else {
        console.log(`  ~ Menu item already exists: ${item.name}`);
      }
    }

    console.log('==================================================');
    console.log(' Seed process completed successfully and cleanly!');
    console.log('==================================================');
  } catch (error) {
    console.error('[Seed Error]:', error);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Database disconnected.');
  }
};

// Execute directly if run as a script
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
