import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, MenuItem, CafeTable, Order, Reservation } from '../models/index.js';
import { config } from '../config/env.js';

dotenv.config();

// ⚠️  DEVELOPMENT / DEMO USE ONLY — Throwaway credentials for local testing.
//    Never use these values in a staging or production environment.
const sampleUsers = [
  {
    name: 'Verdora Administrator',
    email: 'admin@verdora.local',
    plainPassword: 'Admin123!',
    role: 'admin',
  },
  {
    name: 'Nuwan Perera',
    email: 'customer@verdora.local',
    plainPassword: 'Customer123!',
    role: 'customer',
  },
  {
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@verdora.local',
    plainPassword: 'CustomerPass123!',
    role: 'customer',
  },
  {
    name: 'Kavinda Silva',
    email: 'kavinda.silva@verdora.local',
    plainPassword: 'CustomerPass123!',
    role: 'customer',
  },
  {
    name: 'Ananya Sen',
    email: 'ananya.sen@verdora.local',
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
  { tableNumber: 'T-09', capacity: 2, isActive: true },
  { tableNumber: 'T-10', capacity: 4, isActive: true },
  { tableNumber: 'T-11', capacity: 6, isActive: true },
  { tableNumber: 'T-12', capacity: 8, isActive: true },
];

const sampleMenuItems = [
  // ─── BEVERAGES / SPECIALTY COFFEES (10 items) ───
  {
    name: 'Single-Origin Highland Espresso',
    description: 'Ethically sourced high-canopy beans with notes of dark cacao and caramelized honey.',
    category: 'Beverages',
    price: 650,
    imageUrl: '/images/highland-espresso.jpg',
    ingredients: ['Highland Arabica Beans', 'Filtered Spring Water'],
    allergens: [],
    calories: 5,
    isAvailable: true,
  },
  {
    name: 'Artisan Vanilla Oat Latte',
    description: 'Double ristretto infused with Madagascar bourbon vanilla and silky steamed oat milk.',
    category: 'Beverages',
    price: 980,
    imageUrl: '/images/vanilla-oat-latte.jpg',
    ingredients: ['Espresso', 'Madagascar Vanilla', 'Organic Oat Milk'],
    allergens: ['Oats'],
    calories: 140,
    isAvailable: true,
  },
  {
    name: 'Spanish Cortado',
    description: 'Equal parts velvety micro-foamed milk and concentrated dark roast espresso.',
    category: 'Beverages',
    price: 750,
    imageUrl: '/images/spanish-cortado.jpg',
    ingredients: ['Espresso', 'Velvety Steamed Milk'],
    allergens: [],
    calories: 45,
    isAvailable: true,
  },
  {
    name: 'Ceremonial Uji Matcha Latte',
    description: 'Stone-ground first-harvest Japanese green tea whisked with bamboo chasen and oat cream.',
    category: 'Beverages',
    price: 1100,
    imageUrl: '/images/matcha-latte.jpg',
    ingredients: ['Ceremonial Matcha', 'Oat Cream', 'Agave'],
    allergens: ['Oats'],
    calories: 110,
    isAvailable: true,
  },
  {
    name: 'House Nitrogen Cold Brew',
    description: '18-hour cold steeped single origin beans infused with food-grade nitrogen for stout-like creaminess.',
    category: 'Beverages',
    price: 850,
    imageUrl: '/images/nitrogen-cold-brew.jpg',
    ingredients: ['Cold Steeped Arabica', 'Nitrogen Microbubble'],
    allergens: [],
    calories: 10,
    isAvailable: true,
  },
  {
    name: 'Matcha Oat Latte',
    description: 'Ceremonial grade Japanese Uji matcha whisked with velvety steamed organic oat milk and blue agave.',
    category: 'Beverages',
    price: 850,
    imageUrl: '/images/matcha-latte.jpg',
    ingredients: ['Ceremonial Matcha', 'Oat Milk', 'Agave Nectar'],
    allergens: ['Oats'],
    calories: 140,
    isAvailable: true,
  },
  {
    name: 'Activated Charcoal Vanilla Latte',
    description: 'Coconut charcoal micro-powder blended with espresso, vanilla bean, and warm coconut milk.',
    category: 'Beverages',
    price: 920,
    imageUrl: '/images/charcoal-latte.jpg',
    ingredients: ['Espresso', 'Coconut Charcoal', 'Vanilla Bean', 'Coconut Milk'],
    allergens: [],
    calories: 130,
    isAvailable: true,
  },
  {
    name: 'Single-Origin Cold Brew Concentrate (500ml)',
    description: '18-hour cold steeped single origin extract ready to pour over ice or blend with plant milk.',
    category: 'Beverages',
    price: 1800,
    imageUrl: '/images/coldbrew-bottle.jpg',
    ingredients: ['Filtered Water', 'Single-Origin Coffee Beans'],
    allergens: [],
    calories: 10,
    isAvailable: true,
  },
  {
    name: 'Ceremonial Grade Matcha Tin (50g)',
    description: 'First harvest stone-ground ceremonial green tea imported directly from Uji, Kyoto.',
    category: 'Beverages',
    price: 4500,
    imageUrl: '/images/matcha-tin.jpg',
    ingredients: ['100% Ceremonial Matcha Powder'],
    allergens: [],
    calories: 15,
    isAvailable: true,
  },
  {
    name: 'Verdora Highland Blend Beans (250g)',
    description: 'Whole-bean single origin highland Arabica beans roasted in micro-batches with notes of dark cacao and berries.',
    category: 'Beverages',
    price: 3200,
    imageUrl: '/images/highland-beans.jpg',
    ingredients: ['Single-Origin Arabica Coffee Beans'],
    allergens: [],
    calories: 5,
    isAvailable: true,
  },

  // ─── NOURISH BOWLS (5 items) ───
  {
    name: 'Amazonian Açai Super-Bowl',
    description: 'Pure organic açai purée topped with activated granola, banana, chia seeds, and raw honeycomb.',
    category: 'Bowls',
    price: 1850,
    imageUrl: '/images/acai-super-bowl.jpg',
    ingredients: ['Organic Açai', 'Banana', 'Granola', 'Chia Seeds', 'Honey'],
    allergens: ['Nuts', 'Gluten'],
    calories: 380,
    isAvailable: true,
  },
  {
    name: 'Pitaya Chia Glow Bowl',
    description: 'Wild pink pitaya, organic coconut flakes, crushed blueberries, and house flax granola.',
    category: 'Bowls',
    price: 1650,
    imageUrl: '/images/pitaya-chia-bowl.jpg',
    ingredients: ['Pink Pitaya', 'Coconut Flakes', 'Blueberries', 'Flax Granola'],
    allergens: ['Nuts'],
    calories: 340,
    isAvailable: true,
  },
  {
    name: 'Rainbow Quinoa Protein Bowl',
    description: 'Tri-color Andean quinoa, steamed edamame, roasted sweet potato cubes, shredded beetroot, and tahini drizzle.',
    category: 'Bowls',
    price: 1950,
    imageUrl: '/images/quinoa-protein-bowl.jpg',
    ingredients: ['Quinoa', 'Edamame', 'Sweet Potato', 'Beetroot', 'Tahini'],
    allergens: ['Soy', 'Sesame'],
    calories: 450,
    isAvailable: true,
  },
  {
    name: 'Wild Berry Chia Pudding',
    description: 'Chia seeds soaked in unsweetened almond milk layered with raspberry compote and fresh blueberries.',
    category: 'Bowls',
    price: 1200,
    imageUrl: '/images/berry-chia-pudding.jpg',
    ingredients: ['Chia Seeds', 'Almond Milk', 'Blueberries', 'Raspberries'],
    allergens: ['Nuts'],
    calories: 260,
    isAvailable: true,
  },
  {
    name: 'Golden Dragon Fruit Nourish Bowl',
    description: 'Yellow dragon fruit purée, fresh kiwi medallions, roasted coconut chips, and hemp heart sprinkle.',
    category: 'Bowls',
    price: 1750,
    imageUrl: '/images/dragonfruit-bowl.jpg',
    ingredients: ['Yellow Dragon Fruit', 'Kiwi', 'Roasted Coconut Chips', 'Hemp Hearts'],
    allergens: [],
    calories: 310,
    isAvailable: true,
  },

  // ─── COLD-PRESSED JUICES (5 items) ───
  {
    name: 'Green Goddess Glow Juice',
    description: 'Cold-pressed English cucumber, organic celery, granny smith apple, baby spinach, and fresh ginger.',
    category: 'Juices',
    price: 950,
    imageUrl: '/images/green-juice.jpg',
    ingredients: ['Cucumber', 'Celery', 'Green Apple', 'Spinach', 'Ginger'],
    allergens: [],
    calories: 120,
    isAvailable: true,
  },
  {
    name: 'Golden Turmeric Sunshine Elixir',
    description: 'Organic raw turmeric, ginger, valencia orange, and black pepper cold-pressed wellness shot.',
    category: 'Juices',
    price: 650,
    imageUrl: '/images/turmeric-latte.jpg',
    ingredients: ['Turmeric', 'Orange', 'Ginger', 'Black Pepper'],
    allergens: [],
    calories: 75,
    isAvailable: true,
  },
  {
    name: 'Cold-Pressed Watermelon Mint Hydrator',
    description: 'Fresh local seedless watermelon, garden mint leaves, lime juice, and a pinch of pink Himalayan rock salt.',
    category: 'Juices',
    price: 850,
    imageUrl: '/images/watermelon-mint.jpg',
    ingredients: ['Watermelon', 'Fresh Mint', 'Lime', 'Himalayan Salt'],
    allergens: [],
    calories: 90,
    isAvailable: true,
  },
  {
    name: 'Pure Celery Detox Tonic',
    description: '100% pure organic cold-pressed celery juice with a squeeze of Meyer lemon.',
    category: 'Juices',
    price: 900,
    imageUrl: '/images/celery-tonic.jpg',
    ingredients: ['Organic Celery', 'Meyer Lemon'],
    allergens: [],
    calories: 45,
    isAvailable: true,
  },
  {
    name: 'Ruby Beetroot Citrus Vitality',
    description: 'Earthy organic red beetroot, Valencia orange, sweet carrot, and a kick of fresh turmeric root.',
    category: 'Juices',
    price: 920,
    imageUrl: '/images/beetroot-citrus.jpg',
    ingredients: ['Red Beetroot', 'Orange', 'Carrot', 'Turmeric'],
    allergens: [],
    calories: 135,
    isAvailable: true,
  },

  // ─── ARTISAN TOASTS (5 items) ───
  {
    name: 'Artisan Avocado Sourdough Toast',
    description: 'Crushed Hass avocado on toasted whole-grain sourdough with heirloom cherry tomatoes, dukkah, and chili flakes.',
    category: 'Toast',
    price: 1450,
    imageUrl: '/images/avocado-toast.jpg',
    ingredients: ['Whole Wheat Sourdough', 'Hass Avocado', 'Cherry Tomatoes', 'Dukkah', 'Olive Oil'],
    allergens: ['Gluten', 'Sesame'],
    calories: 320,
    isAvailable: true,
  },
  {
    name: 'Sourdough Avocado Tartine',
    description: 'Toasted wild yeast sourdough, whipped Hass avocado, pickled shallots, chili flakes, and microgreens.',
    category: 'Toast',
    price: 1450,
    imageUrl: '/images/avocado-toast.jpg',
    ingredients: ['Wild Yeast Sourdough', 'Hass Avocado', 'Pickled Shallots', 'Microgreens'],
    allergens: ['Gluten'],
    calories: 310,
    isAvailable: true,
  },
  {
    name: 'Wild Forest Mushroom Truffle Sourdough',
    description: 'Pan-seared king oyster and cremini mushrooms on grilled country loaf with white truffle oil and thyme.',
    category: 'Toast',
    price: 1650,
    imageUrl: '/images/mushroom-truffle-toast.jpg',
    ingredients: ['Country Sourdough', 'King Oyster Mushrooms', 'White Truffle Oil', 'Fresh Thyme'],
    allergens: ['Gluten'],
    calories: 340,
    isAvailable: true,
  },
  {
    name: 'Almond Butter Banana Honey Sourdough',
    description: 'House-made stone-ground almond butter, sliced organic bananas, cinnamon, and raw honey drizzle.',
    category: 'Toast',
    price: 1250,
    imageUrl: '/images/almond-banana-toast.jpg',
    ingredients: ['Sourdough Bread', 'Almond Butter', 'Banana', 'Raw Honey', 'Cinnamon'],
    allergens: ['Gluten', 'Nuts'],
    calories: 360,
    isAvailable: true,
  },
  {
    name: 'Admin Artisan Sourdough',
    description: 'Handcrafted signature wild yeast sourdough boule with crispy crust and airy fermented crumb.',
    category: 'Toast',
    price: 1350,
    imageUrl: '/images/artisan-sourdough.jpg',
    ingredients: ['Organic Flour', 'Filtered Water', 'Wild Sourdough Starter', 'Sea Salt'],
    allergens: ['Gluten'],
    calories: 290,
    isAvailable: true,
  },

  // ─── WHOLESOME SNACKS & PANTRY (5 items) ───
  {
    name: 'Truffle Herb Roasted Cashews',
    description: 'Jumbo local cashews hand-tossed in cold-pressed white truffle oil and garden rosemary.',
    category: 'Snacks',
    price: 850,
    imageUrl: '/images/truffle-cashews.jpg',
    ingredients: ['Local Cashews', 'White Truffle Oil', 'Rosemary', 'Flaky Sea Salt'],
    allergens: ['Nuts'],
    calories: 280,
    isAvailable: true,
  },
  {
    name: 'Raw Energy Protein Bites (3 pcs)',
    description: 'Medjool dates, raw cacao powder, crushed almonds, and organic chia seed rolled balls.',
    category: 'Snacks',
    price: 600,
    imageUrl: '/images/energy-bites.jpg',
    ingredients: ['Medjool Dates', 'Cacao', 'Almonds', 'Chia'],
    allergens: ['Nuts'],
    calories: 210,
    isAvailable: true,
  },
  {
    name: 'Activated Grain & Honey Granola (400g)',
    description: 'Slow-toasted activated rolled oats, raw highland honeycomb, pumpkin seeds, and crushed almonds.',
    category: 'Snacks',
    price: 2100,
    imageUrl: '/images/honey-granola.jpg',
    ingredients: ['Activated Oats', 'Raw Honey', 'Pumpkin Seeds', 'Almonds'],
    allergens: ['Nuts', 'Gluten'],
    calories: 340,
    isAvailable: true,
  },
  {
    name: 'Organic Spiced Seed Crackers & House Hummus',
    description: 'Flax, sesame, and chia seed crispbread served with creamy sprouted chickpea tahini hummus.',
    category: 'Snacks',
    price: 1100,
    imageUrl: '/images/seed-crackers-hummus.jpg',
    ingredients: ['Sprouted Chickpeas', 'Tahini', 'Flax Seeds', 'Sesame Seeds', 'Extra Virgin Olive Oil'],
    allergens: ['Sesame'],
    calories: 290,
    isAvailable: true,
  },
  {
    name: 'Raw Cacao Matcha Coconut Truffles',
    description: 'Pure Peruvian cacao butter, shredded coconut, raw agave, and ceremonial matcha coating.',
    category: 'Snacks',
    price: 750,
    imageUrl: '/images/cacao-matcha-truffles.jpg',
    ingredients: ['Cacao Butter', 'Coconut Flakes', 'Ceremonial Matcha', 'Raw Agave'],
    allergens: [],
    calories: 230,
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
    const userDocs = {};
    for (const u of sampleUsers) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        const passwordHash = await User.hashPassword(u.plainPassword);
        user = await User.create({
          name: u.name,
          email: u.email,
          passwordHash,
          role: u.role,
        });
        console.log(`  + Created user: ${u.email} (${u.role})`);
      } else {
        console.log(`  ~ User already exists: ${u.email}`);
      }
      userDocs[u.email] = user;
    }

    // 2. Seed Tables safely
    console.log('[Seed] Seeding cafe tables...');
    const tableDocs = [];
    for (const t of sampleTables) {
      let table = await CafeTable.findOne({ tableNumber: t.tableNumber });
      if (!table) {
        table = await CafeTable.create(t);
        console.log(`  + Created table: ${t.tableNumber} (Cap: ${t.capacity})`);
      } else {
        console.log(`  ~ Table already exists: ${t.tableNumber}`);
      }
      tableDocs.push(table);
    }

    // 3. Seed Menu Items safely
    console.log('[Seed] Seeding menu items...');
    const menuItemDocs = [];
    for (const item of sampleMenuItems) {
      let menuItem = await MenuItem.findOne({ name: item.name });
      if (!menuItem) {
        menuItem = await MenuItem.create(item);
        console.log(`  + Created menu item: ${item.name} (${item.category})`);
      } else {
        menuItem.imageUrl = item.imageUrl;
        menuItem.description = item.description;
        menuItem.price = item.price;
        menuItem.ingredients = item.ingredients;
        menuItem.allergens = item.allergens;
        menuItem.calories = item.calories;
        menuItem.isAvailable = item.isAvailable;
        await menuItem.save();
        console.log(`  ~ Updated menu item: ${item.name} with imageUrl: ${item.imageUrl}`);
      }
      menuItemDocs.push(menuItem);
    }

    // 4. Seed Comprehensive Orders across all 5 statuses and across past 7 days
    console.log('[Seed] Checking orders collection for complete coverage...');
    const customer1 = userDocs['customer@verdora.local'];
    const customer2 = userDocs['sarah.jenkins@verdora.local'] || customer1;
    const customer3 = userDocs['kavinda.silva@verdora.local'] || customer1;
    const customer4 = userDocs['ananya.sen@verdora.local'] || customer1;

    // Check if each status exists in DB
    const existingStatuses = await Order.distinct('status');
    const requiredStatuses = ['placed', 'preparing', 'ready', 'completed', 'cancelled'];
    const hasMissingStatus = requiredStatuses.some((st) => !existingStatuses.includes(st));

    if (hasMissingStatus || (await Order.countDocuments()) < 8) {
      console.log('[Seed] Generating complete orders covering all 5 pipeline statuses and weekly trend...');
      
      const ordersToSeed = [
        // ── PLACED (Active in Kitchen Queue) ──
        {
          user: customer1,
          items: [
            { item: menuItemDocs[0], qty: 2 }, // Espresso
            { item: menuItemDocs[10], qty: 1 }, // Açai Bowl
          ],
          status: 'placed',
          notes: 'Extra chia seeds on the Açai bowl please',
          daysAgo: 0,
        },
        {
          user: customer2,
          items: [
            { item: menuItemDocs[1], qty: 1 }, // Vanilla Oat Latte
            { item: menuItemDocs[20], qty: 1 }, // Avocado Sourdough
          ],
          status: 'placed',
          notes: 'Oat milk extra hot',
          daysAgo: 0,
        },

        // ── PREPARING (Cooking / Brewing) ──
        {
          user: customer3,
          items: [
            { item: menuItemDocs[3], qty: 2 }, // Matcha Latte
            { item: menuItemDocs[12], qty: 1 }, // Quinoa Bowl
          ],
          status: 'preparing',
          notes: 'Dressing on the side',
          daysAgo: 0,
        },
        {
          user: customer4,
          items: [
            { item: menuItemDocs[15], qty: 2 }, // Green Goddess
            { item: menuItemDocs[24], qty: 1 }, // Truffle Cashews
          ],
          status: 'preparing',
          notes: 'No celery if possible',
          daysAgo: 1,
        },

        // ── READY (Awaiting Pickup / Dining Table Delivery) ──
        {
          user: customer1,
          items: [
            { item: menuItemDocs[4], qty: 1 }, // Nitro Cold Brew
            { item: menuItemDocs[21], qty: 1 }, // Sourdough Tartine
          ],
          status: 'ready',
          notes: 'Ready for Table T-03',
          daysAgo: 1,
        },
        {
          user: customer2,
          items: [
            { item: menuItemDocs[16], qty: 2 }, // Turmeric Sunshine
            { item: menuItemDocs[11], qty: 1 }, // Pitaya Chia Bowl
          ],
          status: 'ready',
          notes: 'Table T-01',
          daysAgo: 2,
        },

        // ── COMPLETED (Settled & Fulfilled) ──
        {
          user: customer3,
          items: [
            { item: menuItemDocs[9], qty: 1 }, // Highland Blend Beans
            { item: menuItemDocs[8], qty: 1 }, // Matcha Tin
          ],
          status: 'completed',
          notes: 'Gift wrapped take-home roastery pack',
          daysAgo: 2,
        },
        {
          user: customer1,
          items: [
            { item: menuItemDocs[17], qty: 2 }, // Watermelon Mint
            { item: menuItemDocs[22], qty: 1 }, // Mushroom Truffle Toast
          ],
          status: 'completed',
          notes: 'Delicious brunch',
          daysAgo: 3,
        },
        {
          user: customer4,
          items: [
            { item: menuItemDocs[2], qty: 2 }, // Cortado
            { item: menuItemDocs[25], qty: 2 }, // Raw Energy Bites
          ],
          status: 'completed',
          notes: 'Quick work coffee break',
          daysAgo: 4,
        },
        {
          user: customer2,
          items: [
            { item: menuItemDocs[13], qty: 1 }, // Wild Berry Chia
            { item: menuItemDocs[7], qty: 1 }, // Cold Brew Concentrate
          ],
          status: 'completed',
          notes: 'Express pickup',
          daysAgo: 5,
        },
        {
          user: customer3,
          items: [
            { item: menuItemDocs[14], qty: 1 }, // Golden Dragon Bowl
            { item: menuItemDocs[18], qty: 1 }, // Pure Celery Juice
          ],
          status: 'completed',
          notes: 'Weekly detox breakfast',
          daysAgo: 6,
        },

        // ── CANCELLED (Customer / Kitchen Cancellations) ──
        {
          user: customer1,
          items: [
            { item: menuItemDocs[5], qty: 1 }, // Matcha Oat Latte
            { item: menuItemDocs[23], qty: 1 }, // Almond Butter Toast
          ],
          status: 'cancelled',
          notes: 'Client had to reschedule meeting',
          daysAgo: 3,
        },
        {
          user: customer4,
          items: [
            { item: menuItemDocs[6], qty: 1 }, // Activated Charcoal Latte
          ],
          status: 'cancelled',
          notes: 'Changed party size and re-ordered',
          daysAgo: 4,
        },
      ];

      for (const ord of ordersToSeed) {
        const lineItems = ord.items.map((line) => ({
          menuItemId: line.item._id,
          itemNameSnapshot: line.item.name,
          unitPriceSnapshot: line.item.price,
          quantity: line.qty,
        }));
        const subtotal = lineItems.reduce((acc, l) => acc + l.unitPriceSnapshot * l.quantity, 0);

        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - ord.daysAgo);

        const newOrder = await Order.create({
          userId: ord.user._id,
          items: lineItems,
          subtotal,
          status: ord.status,
          notes: ord.notes,
        });

        // Set the exact past timestamp in MongoDB
        await Order.collection.updateOne(
          { _id: newOrder._id },
          { $set: { createdAt: createdDate, updatedAt: createdDate } }
        );
      }
      console.log(`  + Seeded 13 complete orders across placed, preparing, ready, completed, cancelled!`);
    }

    // 5. Seed Comprehensive Reservations across all statuses (today, past, upcoming)
    console.log('[Seed] Checking table reservations for complete coverage...');
    const existingResStatuses = await Reservation.distinct('status');
    const hasMissingResStatus = ['confirmed', 'completed', 'cancelled'].some(
      (st) => !existingResStatuses.includes(st)
    );

    if (hasMissingResStatus || (await Reservation.countDocuments()) < 6) {
      console.log('[Seed] Generating reservations across confirmed, completed, cancelled...');
      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);
      const tomorrow = new Date(Date.now() + 86400000);

      const reservationsToSeed = [
        // ── TODAY (Confirmed Bookings for Floor Management) ──
        {
          user: customer1,
          table: tableDocs[0], // T-01
          date: today,
          startTime: '08:30',
          endTime: '10:00',
          guestCount: 2,
          status: 'confirmed',
          specialRequest: 'Solo work session & breakfast',
        },
        {
          user: customer2,
          table: tableDocs[2], // T-03
          date: today,
          startTime: '13:00',
          endTime: '14:30',
          guestCount: 4,
          status: 'confirmed',
          specialRequest: 'Client wellness lunch meeting',
        },
        {
          user: customer3,
          table: tableDocs[5], // T-06
          date: today,
          startTime: '18:30',
          endTime: '20:00',
          guestCount: 6,
          status: 'confirmed',
          specialRequest: 'Botanical Banquette - Birthday tasting dinner',
        },

        // ── TOMORROW / UPCOMING (Confirmed Bookings) ──
        {
          user: customer4,
          table: tableDocs[6], // T-07
          date: tomorrow,
          startTime: '10:30',
          endTime: '12:00',
          guestCount: 4,
          status: 'confirmed',
          specialRequest: 'Family weekend brunch reservation',
        },
        {
          user: customer1,
          table: tableDocs[7], // T-08
          date: tomorrow,
          startTime: '18:30',
          endTime: '20:00',
          guestCount: 8,
          status: 'confirmed',
          specialRequest: 'Private lounge reservation for design studio',
        },

        // ── COMPLETED (Past Dining Parties) ──
        {
          user: customer2,
          table: tableDocs[1], // T-02
          date: yesterday,
          startTime: '10:30',
          endTime: '12:00',
          guestCount: 2,
          status: 'completed',
          specialRequest: 'Window alcove brunch - completed',
        },
        {
          user: customer3,
          table: tableDocs[3], // T-04
          date: yesterday,
          startTime: '19:00',
          endTime: '20:30',
          guestCount: 4,
          status: 'completed',
          specialRequest: 'Evening dinner - completed successfully',
        },

        // ── CANCELLED (Customer Released Slots) ──
        {
          user: customer4,
          table: tableDocs[4], // T-05
          date: yesterday,
          startTime: '16:00',
          endTime: '17:30',
          guestCount: 4,
          status: 'cancelled',
          specialRequest: 'Cancelled by customer due to travel conflict',
        },
        {
          user: customer1,
          table: tableDocs[9] || tableDocs[0], // T-10
          date: today,
          startTime: '16:00',
          endTime: '17:30',
          guestCount: 2,
          status: 'cancelled',
          specialRequest: 'Guest had sudden conflict - slot released',
        },
      ];

      for (const resData of reservationsToSeed) {
        await Reservation.create({
          userId: resData.user._id,
          tableId: resData.table._id,
          reservationDate: resData.date,
          startTime: resData.startTime,
          endTime: resData.endTime,
          guestCount: resData.guestCount,
          status: resData.status,
          specialRequest: resData.specialRequest,
        });
      }
      console.log(`  + Seeded 9 table reservations across confirmed, completed, cancelled!`);
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
