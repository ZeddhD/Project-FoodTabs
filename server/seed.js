import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Dish from './models/Dish.js';
import Review from './models/Review.js';

const hash = (pw) => bcryptjs.hash(pw, 10);

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function daysAgo(n) { return daysFromNow(-n); }
function nextWeekday(day) {
  const d = new Date();
  const diff = (day - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodtabs');
  console.log('Connected to MongoDB');

  // ── Drop all collections ──────────────────────────────────────────────────
  const collections = ['users','restaurants','dishes','reviews'];
  for (const col of collections) {
    try { await mongoose.connection.dropCollection(col); } catch { /* didn't exist */ }
  }
  console.log('All collections dropped');

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminPw   = await hash('Admin@1234');
  const ownerPw   = await hash('Owner@1234');
  const custPw    = await hash('Customer@1234');

  const [
    admin, rahim, sumaiya, tariq, kenji, lorenzo, mizanur, dr_sara, amir,
    ahmed, nadia, rina, farhan, mitu, kabir, sonia, rakib, priya, jasim
  ] = await User.insertMany([
    { name: 'Platform Admin',  email: 'admin@foodtabs.com',   password: adminPw,  role: 'admin',    isVerified: true },
    { name: 'Rahim Uddin',     email: 'rahim@foodtabs.com',   password: ownerPw,  role: 'owner',    isVerified: true },
    { name: 'Sumaiya Begum',   email: 'sumaiya@foodtabs.com', password: ownerPw,  role: 'owner',    isVerified: true },
    { name: 'Tariq Hossain',   email: 'tariq@foodtabs.com',   password: ownerPw,  role: 'owner',    isVerified: true },
    { name: 'Kenji Nakamura',  email: 'kenji@foodtabs.com',   password: ownerPw,  role: 'owner',    isVerified: true },
    { name: 'Lorenzo Romano',  email: 'lorenzo@foodtabs.com', password: ownerPw,  role: 'owner',    isVerified: true },
    { name: 'Mizanur Rahman',  email: 'mizanur@foodtabs.com', password: ownerPw,  role: 'owner',    isVerified: true },
    { name: 'Dr. Sara Ahmed',  email: 'sara@foodtabs.com',    password: ownerPw,  role: 'owner',    isVerified: true },
    { name: 'Amir Hassan',     email: 'amir@foodtabs.com',    password: ownerPw,  role: 'owner',    isVerified: true },
    { name: 'Ahmed Hassan',    email: 'ahmed@foodtabs.com',   password: custPw,   role: 'customer', isVerified: true,  preferences: { cuisines: ['Biriyani','Street Food'] } },
    { name: 'Nadia Islam',     email: 'nadia@foodtabs.com',   password: custPw,   role: 'customer', isVerified: true,  preferences: { cuisines: ['Desserts','Italian'] } },
    { name: 'Rina Akter',      email: 'rina@foodtabs.com',    password: custPw,   role: 'customer', isVerified: true,  preferences: { cuisines: ['Biriyani','BBQ'] } },
    { name: 'Farhan Kabir',    email: 'farhan@foodtabs.com',  password: custPw,   role: 'customer', isVerified: false, preferences: { cuisines: ['Chinese','Seafood'] } },
    { name: 'Mitu Chowdhury',  email: 'mitu@foodtabs.com',    password: custPw,   role: 'customer', isVerified: true,  preferences: { cuisines: ['Healthy','Italian'] } },
    { name: 'Kabir Mahmud',    email: 'kabir@foodtabs.com',   password: custPw,   role: 'customer', isVerified: true,  preferences: { cuisines: ['Street Food','BBQ'] }, warningCount: 1 },
    { name: 'Sonia Parvin',    email: 'sonia@foodtabs.com',   password: custPw,   role: 'customer', isVerified: true,  preferences: { cuisines: ['Desserts','Biriyani'] } },
    { name: 'Rakib Hasan',     email: 'rakib@foodtabs.com',   password: custPw,   role: 'customer', isVerified: true,  preferences: { cuisines: ['Seafood','Chinese'] } },
    { name: 'Priya Das',       email: 'priya@foodtabs.com',   password: custPw,   role: 'customer', isVerified: true,  preferences: { cuisines: ['Healthy','Desserts'] } },
    { name: 'Jasim Uddin',     email: 'jasim@foodtabs.com',   password: custPw,   role: 'customer', isVerified: true,  preferences: { cuisines: ['Biriyani','Street Food'] } },
  ]);
  console.log('Users created');

  // ── Restaurants ───────────────────────────────────────────────────────────
  const [r1,r2,r3,r4,r5,r6,r7,r8] = await Restaurant.insertMany([
    {
      name: 'Star Kacchi House', ownerId: rahim._id,
      description: "Dhaka's most beloved Kacchi Biriyani spot since 1987. Family recipes passed down three generations. Known for perfectly spiced basmati rice and slow-cooked beef.",
      cuisineTypes: ['Biriyani','Mughlai'],
      address: 'Road 7, Dhanmondi', city: 'Dhanmondi',
      phone: '01711-234567', email: 'starkacchi@foodtabs.com',
      coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/restaurants/kacchi.jpg',
      images: ['https://res.cloudinary.com/demo/image/upload/v1/restaurants/kacchi.jpg'],
      openingHours: {
        saturday:{open:'11:00',close:'23:00'},sunday:{open:'11:00',close:'23:00'},
        monday:{open:'11:00',close:'23:00'},tuesday:{open:'11:00',close:'23:00'},
        wednesday:{open:'11:00',close:'23:00'},thursday:{open:'11:00',close:'23:00'},
        friday:{open:'13:00',close:'23:00'}
      },
      isVerified: true, isActive: true, priceRange: '$$', bookingDeposit: 200,
      tags: ['Biriyani','Mughlai','Family Friendly','Heritage']
    },
    {
      name: 'Gulshan Grill and Co', ownerId: sumaiya._id,
      description: 'Premium outdoor grilling experience in the heart of Gulshan. Specializing in charcoal-grilled meats, fresh salads, and wood-fired bread.',
      cuisineTypes: ['BBQ','Continental','Grills'],
      address: 'Road 53, Gulshan 2', city: 'Gulshan',
      phone: '01812-345678', email: 'gulshanGrill@foodtabs.com',
      coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/restaurants/grill.jpg',
      images: ['https://res.cloudinary.com/demo/image/upload/v1/restaurants/grill.jpg'],
      openingHours: {
        saturday:{open:'12:00',close:'00:00'},sunday:{open:'12:00',close:'00:00'},
        monday:{open:'12:00',close:'00:00'},tuesday:{open:'12:00',close:'00:00'},
        wednesday:{open:'12:00',close:'00:00'},thursday:{open:'12:00',close:'00:00'},
        friday:{open:'12:00',close:'00:00'}
      },
      isVerified: true, isActive: true, priceRange: '$$$$', bookingDeposit: 500,
      tags: ['BBQ','Fine Dining','Outdoor','Gulshan']
    },
    {
      name: 'Puran Dhaka Bhojon', ownerId: tariq._id,
      description: 'Authentic Old Dhaka cuisine in a setting that has not changed in 40 years. Bakarkhani, Naan, Beef Tehari, and hand-pulled sweets made fresh daily.',
      cuisineTypes: ['Bangladeshi','Street Food'],
      address: 'Chawkbazar Lane 3, Old Dhaka', city: 'Old Dhaka',
      phone: '01611-456789', email: 'purandhaka@foodtabs.com',
      coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/restaurants/purandhaka.jpg',
      images: ['https://res.cloudinary.com/demo/image/upload/v1/restaurants/purandhaka.jpg'],
      openingHours: {
        saturday:{open:'07:00',close:'22:00'},sunday:{open:'07:00',close:'22:00'},
        monday:{open:'07:00',close:'22:00'},tuesday:{open:'07:00',close:'22:00'},
        wednesday:{open:'07:00',close:'22:00'},thursday:{open:'07:00',close:'22:00'},
        friday:{open:null,close:null}
      },
      isVerified: true, isActive: true, priceRange: '$', bookingDeposit: 100,
      tags: ['Heritage','Tehari','Old Dhaka','Traditional']
    },
    {
      name: 'Sakura Japanese Kitchen', ownerId: kenji._id,
      description: "Dhaka's most authentic Japanese dining experience. Fresh fish flown in twice weekly. Traditional ramen broth simmered for 18 hours.",
      cuisineTypes: ['Japanese','Sushi','Ramen'],
      address: 'Road 11, Banani', city: 'Banani',
      phone: '01912-567890', email: 'sakura@foodtabs.com',
      coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/restaurants/sakura.jpg',
      images: ['https://res.cloudinary.com/demo/image/upload/v1/restaurants/sakura.jpg'],
      openingHours: {
        saturday:{open:'12:00',close:'23:00'},sunday:{open:'12:00',close:'23:00'},
        monday:{open:'12:00',close:'23:00'},tuesday:{open:'12:00',close:'23:00'},
        wednesday:{open:'12:00',close:'23:00'},thursday:{open:'12:00',close:'23:00'},
        friday:{open:'12:00',close:'23:00'}
      },
      isVerified: true, isActive: true, priceRange: '$$$', bookingDeposit: 300,
      tags: ['Japanese','Sushi','Ramen','Premium']
    },
    {
      name: 'Bella Napoli', ownerId: lorenzo._id,
      description: 'Wood-fired Neapolitan pizzas and handmade pasta in a cozy European-style setting. Imported Italian ingredients. House-made tiramisu.',
      cuisineTypes: ['Italian','Pizza','Pasta'],
      address: 'Road 28, Gulshan 1', city: 'Gulshan',
      phone: '01711-678901', email: 'bellanapoli@foodtabs.com',
      coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/restaurants/bella.jpg',
      images: ['https://res.cloudinary.com/demo/image/upload/v1/restaurants/bella.jpg'],
      openingHours: {
        saturday:{open:'11:00',close:'23:00'},sunday:{open:'11:00',close:'23:00'},
        monday:{open:'11:00',close:'23:00'},tuesday:{open:'11:00',close:'23:00'},
        wednesday:{open:'11:00',close:'23:00'},thursday:{open:'11:00',close:'23:00'},
        friday:{open:'11:00',close:'23:00'}
      },
      isVerified: true, isActive: true, priceRange: '$$$', bookingDeposit: 250,
      tags: ['Italian','Pizza','Pasta','Romantic']
    },
    {
      name: 'Mezban Street Kitchen', ownerId: mizanur._id,
      description: 'The best fuchka, chotpoti, and shawarma in Mirpur. Standing-only seating, maximum freshness, minimum fuss.',
      cuisineTypes: ['Street Food','Bangladeshi'],
      address: 'Section 6, Mirpur 10', city: 'Mirpur',
      phone: '01511-789012', email: 'mezban@foodtabs.com',
      coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/restaurants/mezban.jpg',
      images: ['https://res.cloudinary.com/demo/image/upload/v1/restaurants/mezban.jpg'],
      openingHours: {
        saturday:{open:'15:00',close:'01:00'},sunday:{open:'15:00',close:'01:00'},
        monday:{open:'15:00',close:'01:00'},tuesday:{open:'15:00',close:'01:00'},
        wednesday:{open:'15:00',close:'01:00'},thursday:{open:'15:00',close:'01:00'},
        friday:{open:'15:00',close:'01:00'}
      },
      isVerified: true, isActive: true, priceRange: '$', bookingDeposit: 0,
      tags: ['Street Food','Fuchka','Shawarma','Late Night']
    },
    {
      name: 'The Healthy Bowl', ownerId: dr_sara._id,
      description: "Dhaka's first dedicated clean-eating restaurant. Calorie counts on every item. Organic local produce. Customizable macro bowls.",
      cuisineTypes: ['Healthy','Salads'],
      address: 'Sector 7, Uttara', city: 'Uttara',
      phone: '01411-890123', email: 'healthybowl@foodtabs.com',
      coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/restaurants/healthy.jpg',
      images: ['https://res.cloudinary.com/demo/image/upload/v1/restaurants/healthy.jpg'],
      openingHours: {
        saturday:{open:'08:00',close:'22:00'},sunday:{open:'08:00',close:'22:00'},
        monday:{open:'08:00',close:'22:00'},tuesday:{open:'08:00',close:'22:00'},
        wednesday:{open:'08:00',close:'22:00'},thursday:{open:'08:00',close:'22:00'},
        friday:{open:'08:00',close:'22:00'}
      },
      isVerified: true, isActive: true, priceRange: '$$', bookingDeposit: 0,
      tags: ['Healthy','Organic','Salad','Uttara']
    },
    {
      name: 'Blue Ocean Seafood', ownerId: amir._id,
      description: 'Fresh catch from the Bay of Bengal served in classic Bengali and fusion styles. Live lobster tank.',
      cuisineTypes: ['Seafood','Bangladeshi'],
      address: 'Road 27, Dhanmondi', city: 'Dhanmondi',
      phone: '01311-901234', email: 'blueocean@foodtabs.com',
      coverImage: 'https://res.cloudinary.com/demo/image/upload/v1/restaurants/blueocean.jpg',
      images: ['https://res.cloudinary.com/demo/image/upload/v1/restaurants/blueocean.jpg'],
      openingHours: {
        saturday:{open:'11:00',close:'23:00'},sunday:{open:'11:00',close:'23:00'},
        monday:{open:'11:00',close:'23:00'},tuesday:{open:'11:00',close:'23:00'},
        wednesday:{open:'11:00',close:'23:00'},thursday:{open:'11:00',close:'23:00'},
        friday:{open:'11:00',close:'23:00'}
      },
      isVerified: true, isActive: true, priceRange: '$$$', bookingDeposit: 400,
      tags: ['Seafood','Bengali','Fresh Catch','New']
    }
  ]);

  // ── Dishes ────────────────────────────────────────────────────────────────
  const dishMap = {}; // restaurantName -> { dishName -> dish }

  const allDishes = await Dish.insertMany([
    // Star Kacchi House
    { restaurantId:r1._id, name:'Kacchi Biriyani (Beef)',   description:'Slow-cooked beef with aromatic basmati rice',  price:380, category:'Biriyani', isAvailable:true },
    { restaurantId:r1._id, name:'Kacchi Biriyani (Mutton)', description:'Tender mutton layered with spiced basmati',    price:420, category:'Biriyani', isAvailable:true },
    { restaurantId:r1._id, name:'Morog Polao',              description:'Whole chicken cooked in fragrant polao rice',  price:320, category:'Rice',    isAvailable:true },
    { restaurantId:r1._id, name:'Beef Rezala',              description:'Slow-cooked beef in white gravy',              price:280, category:'Curry',   isAvailable:true },
    { restaurantId:r1._id, name:'Borhani',                  description:'Spiced yoghurt drink',                        price:60,  category:'Drinks',  isAvailable:true },
    { restaurantId:r1._id, name:'Firni',                    description:'Traditional rice pudding',                    price:80,  category:'Dessert', isAvailable:true },
    { restaurantId:r1._id, name:'Shahi Tukra',              description:'Fried bread soaked in sweetened milk',        price:90,  category:'Dessert', isAvailable:true },
    { restaurantId:r1._id, name:'Naan',                     description:'Soft tandoor-baked flatbread',                price:30,  category:'Bread',   isAvailable:true },
    { restaurantId:r1._id, name:'Salad Platter',            description:'Fresh seasonal vegetables',                   price:70,  category:'Sides',   isAvailable:true },
    { restaurantId:r1._id, name:'Roasted Leg Piece',        description:'Whole roasted chicken leg in house spices',   price:350, category:'Chicken', isAvailable:true },
    // Gulshan Grill
    { restaurantId:r2._id, name:'Ribeye Steak 300g',        description:'USDA beef, charcoal-grilled to perfection',   price:1800,category:'Grill',   isAvailable:true },
    { restaurantId:r2._id, name:'Mixed Grill Platter',      description:'Assorted cuts for sharing',                   price:2200,category:'Grill',   isAvailable:true },
    { restaurantId:r2._id, name:'BBQ Chicken Half',         description:'Half chicken marinated overnight',            price:750, category:'Grill',   isAvailable:true },
    { restaurantId:r2._id, name:'Grilled Fish Fillet',      description:'Fresh sea bass with herb butter',             price:950, category:'Seafood', isAvailable:true },
    { restaurantId:r2._id, name:'Caesar Salad',             description:'Crisp romaine, croutons, parmesan',           price:450, category:'Salad',   isAvailable:true },
    { restaurantId:r2._id, name:'Garlic Bread',             description:'Wood-fired with roasted garlic butter',       price:220, category:'Sides',   isAvailable:true },
    { restaurantId:r2._id, name:'Loaded Fries',             description:'Topped with cheese sauce and jalapeños',      price:380, category:'Sides',   isAvailable:true },
    { restaurantId:r2._id, name:'Mushroom Soup',            description:'Creamy wild mushroom bisque',                 price:320, category:'Soup',    isAvailable:true },
    { restaurantId:r2._id, name:'Chocolate Lava Cake',      description:'Warm molten dark chocolate, vanilla ice cream',price:420,category:'Dessert', isAvailable:true },
    { restaurantId:r2._id, name:'Mango Sorbet',             description:'Alphonso mango sorbet, fresh mint',           price:280, category:'Dessert', isAvailable:true },
    { restaurantId:r2._id, name:'Fresh Lemonade',           description:'House-pressed with ginger and mint',          price:180, category:'Drinks',  isAvailable:true },
    // Puran Dhaka Bhojon
    { restaurantId:r3._id, name:'Beef Tehari',              description:'Old Dhaka style beef tehari with ghee',       price:180, category:'Rice',    isAvailable:true },
    { restaurantId:r3._id, name:'Mutton Tehari',            description:'Tender mutton pieces in fragrant rice',       price:220, category:'Rice',    isAvailable:true },
    { restaurantId:r3._id, name:'Bakarkhani',               description:'Layered flatbread baked fresh daily',         price:20,  category:'Bread',   isAvailable:true },
    { restaurantId:r3._id, name:'Naan Roti',                description:'Soft thin flatbread',                         price:15,  category:'Bread',   isAvailable:true },
    { restaurantId:r3._id, name:'Beef Bhuna',               description:'Dry spiced beef curry',                       price:200, category:'Curry',   isAvailable:true },
    { restaurantId:r3._id, name:'Roasted Chicken',          description:'Whole spice-rubbed roasted chicken',          price:280, category:'Chicken', isAvailable:true },
    { restaurantId:r3._id, name:'Dal',                      description:'Yellow lentils with mustard tempering',       price:60,  category:'Sides',   isAvailable:true },
    { restaurantId:r3._id, name:'Shahi Halwa',              description:'Rich semolina halwa with saffron',            price:80,  category:'Dessert', isAvailable:true },
    { restaurantId:r3._id, name:'Borhani',                  description:'House spiced yoghurt drink',                  price:40,  category:'Drinks',  isAvailable:true },
    { restaurantId:r3._id, name:'Firni',                    description:'Chilled rice pudding in clay pot',            price:60,  category:'Dessert', isAvailable:true },
    // Sakura
    { restaurantId:r4._id, name:'Salmon Sashimi (6 pcs)',   description:'Fresh Atlantic salmon, soy and wasabi',       price:980, category:'Sashimi', isAvailable:true },
    { restaurantId:r4._id, name:'Dragon Roll (8 pcs)',       description:'Prawn tempura, avocado, spicy mayo',          price:850, category:'Sushi',   isAvailable:true },
    { restaurantId:r4._id, name:'Tonkotsu Ramen',           description:'Rich pork bone broth, 18 hours slow-cooked',  price:680, category:'Ramen',   isAvailable:true },
    { restaurantId:r4._id, name:'Chicken Katsu Curry',      description:'Panko chicken, Japanese curry sauce',         price:620, category:'Mains',   isAvailable:true },
    { restaurantId:r4._id, name:'Edamame',                  description:'Steamed young soybeans with sea salt',        price:220, category:'Starters',isAvailable:true },
    { restaurantId:r4._id, name:'Miso Soup',                description:'Dashi broth, silken tofu, wakame',            price:180, category:'Soup',    isAvailable:true },
    { restaurantId:r4._id, name:'Gyoza (6 pcs)',            description:'Pan-fried pork and cabbage dumplings',        price:380, category:'Starters',isAvailable:true },
    { restaurantId:r4._id, name:'Matcha Ice Cream',         description:'Uji matcha soft serve',                       price:280, category:'Dessert', isAvailable:true },
    { restaurantId:r4._id, name:'Green Tea',                description:'Hot or iced Sencha green tea',                price:150, category:'Drinks',  isAvailable:true },
    // Bella Napoli
    { restaurantId:r5._id, name:'Margherita Pizza',         description:'San Marzano tomato, buffalo mozzarella, basil',price:680,category:'Pizza',   isAvailable:true },
    { restaurantId:r5._id, name:'Pepperoni Pizza',          description:'Classic Calabrese pepperoni, fior di latte',  price:820, category:'Pizza',   isAvailable:true },
    { restaurantId:r5._id, name:'Spaghetti Carbonara',      description:'Guanciale, egg yolk, Pecorino Romano',        price:720, category:'Pasta',   isAvailable:true },
    { restaurantId:r5._id, name:'Penne Arrabbiata',         description:'San Marzano tomato, chilli, garlic, basil',   price:620, category:'Pasta',   isAvailable:true },
    { restaurantId:r5._id, name:'Bruschetta',               description:'Sourdough, tomato, basil, aged balsamic',     price:380, category:'Starters',isAvailable:true },
    { restaurantId:r5._id, name:'Tiramisu',                 description:'House-made with Mascarpone, Savoiardi',       price:420, category:'Dessert', isAvailable:true },
    { restaurantId:r5._id, name:'Panna Cotta',              description:'Vanilla bean panna cotta, berry compote',     price:380, category:'Dessert', isAvailable:true },
    { restaurantId:r5._id, name:'San Pellegrino',           description:'Sparkling natural mineral water',             price:220, category:'Drinks',  isAvailable:true },
    // Mezban
    { restaurantId:r6._id, name:'Fuchka (8 pcs)',           description:'Crispy shells with tamarind water',           price:60,  category:'Snacks',  isAvailable:true },
    { restaurantId:r6._id, name:'Chotpoti',                 description:'Chickpea chaat with tamarind and spice',      price:80,  category:'Snacks',  isAvailable:true },
    { restaurantId:r6._id, name:'Chicken Shawarma',         description:'Marinated chicken, garlic sauce, wrap',       price:120, category:'Wraps',   isAvailable:true },
    { restaurantId:r6._id, name:'Beef Shawarma',            description:'Slow-cooked beef slices, pita wrap',          price:140, category:'Wraps',   isAvailable:true },
    { restaurantId:r6._id, name:'Jhalmuri',                 description:'Puffed rice with mustard oil and spices',     price:40,  category:'Snacks',  isAvailable:true },
    { restaurantId:r6._id, name:'Aloo Chop',                description:'Crispy potato patties with chilli',           price:30,  category:'Snacks',  isAvailable:true },
    { restaurantId:r6._id, name:'Egg Chop',                 description:'Boiled egg wrapped in spiced potato',         price:35,  category:'Snacks',  isAvailable:true },
    { restaurantId:r6._id, name:'Mango Lassi',              description:'Fresh mango blended with yoghurt',            price:70,  category:'Drinks',  isAvailable:true },
    { restaurantId:r6._id, name:'Fresh Coconut Water',      description:'Young green coconut served fresh',            price:60,  category:'Drinks',  isAvailable:true },
    // Healthy Bowl
    { restaurantId:r7._id, name:'Classic Macro Bowl',       description:'Quinoa, grilled chicken, roasted veggies',    price:480, category:'Bowls',   isAvailable:true },
    { restaurantId:r7._id, name:'Protein Power Bowl',       description:'Brown rice, egg white, edamame, chickpea',    price:520, category:'Bowls',   isAvailable:true },
    { restaurantId:r7._id, name:'Green Detox Smoothie',     description:'Spinach, cucumber, ginger, lemon, apple',     price:280, category:'Drinks',  isAvailable:true },
    { restaurantId:r7._id, name:'Grilled Chicken Wrap',     description:'Multigrain wrap, lettuce, mustard dressing',  price:380, category:'Wraps',   isAvailable:true },
    { restaurantId:r7._id, name:'Quinoa Salad',             description:'Tri-colour quinoa, herbs, lemon vinaigrette', price:420, category:'Salad',   isAvailable:true },
    { restaurantId:r7._id, name:'Overnight Oats',           description:'Oat jar with chia seeds and seasonal fruit',  price:280, category:'Breakfast',isAvailable:true },
    { restaurantId:r7._id, name:'Avocado Toast',            description:'Sourdough, smashed avocado, poached egg',     price:320, category:'Breakfast',isAvailable:true },
    { restaurantId:r7._id, name:'Acai Bowl',                description:'Frozen acai, granola, fresh fruit, honey',    price:450, category:'Bowls',   isAvailable:true },
    // Blue Ocean (pending — still seed dishes for when admin approves)
    { restaurantId:r8._id, name:'Whole Grilled Hilsa',      description:'Fresh Padma hilsa grilled with mustard',      price:1200,category:'Seafood', isAvailable:true },
    { restaurantId:r8._id, name:'Prawn Masala',             description:'King prawns in rich Bengali spice gravy',     price:880, category:'Seafood', isAvailable:true },
    { restaurantId:r8._id, name:'Lobster Thermidor',        description:'Fresh lobster, creamy mustard sauce',         price:2800,category:'Seafood', isAvailable:true },
    { restaurantId:r8._id, name:'Fish and Chips',           description:'Battered rui fish, hand-cut chips',           price:580, category:'Mains',   isAvailable:true },
    { restaurantId:r8._id, name:'Prawn Cocktail',           description:'Chilled prawns, Marie Rose sauce',            price:620, category:'Starters',isAvailable:true },
    { restaurantId:r8._id, name:'Crab Curry',               description:'Mud crab in Bengali mustard gravy',           price:950, category:'Seafood', isAvailable:true },
    { restaurantId:r8._id, name:'Clam Chowder',             description:'Creamy New England style with local clams',   price:420, category:'Soup',    isAvailable:true },
    { restaurantId:r8._id, name:'Grilled Squid',            description:'Whole squid with chimichurri and lemon',      price:680, category:'Seafood', isAvailable:true },
  ]);
  console.log(`${allDishes.length} dishes created`);

  // ── Reviews ───────────────────────────────────────────────────────────────
  // Helper to build review
  const rev = (userId, restaurantId, opts={}) => ({
    userId, restaurantId,
    title: opts.title || 'My experience',
    content: opts.content || 'Great place!',
    rating: opts.rating || 4,
    ratings: opts.ratings || {},
    dishId: opts.dishId || null,
    dishReviews: opts.dishReviews || [],
    photos: opts.photos || [],
    verifiedVisit:   opts.verified || false,
    verifiedPurchase:opts.verified || false,
    isVerified:      opts.verified || false,
    isPublished: opts.isPublished !== false,
    isFlagged:   opts.isFlagged   || false,
    isReported:  opts.isReported  || false,
    likeCount: opts.likeCount || 0,
    createdAt: opts.date || daysAgo(Math.floor(Math.random()*60)+1)
  });

  const reviews = await Review.insertMany([
    // ── Star Kacchi House (r1) ──────────────────────────────────────────────
    rev(rina._id,  r1._id, { title:'Kacchi that hits different every single time', rating:5,
      ratings:{taste:5,hygiene:4,service:3,ambience:3,value:5}, likeCount:18,
      dishReviews:dr(['Kacchi Biriyani (Beef)',5,'Tender and fragrant, falling off the bone'],['Borhani',5,'Freshly churned, perfectly tangy']),
      content:"Kacchi biriyani is literally my comfort food and this place never disappoints. Came for my cousin's dawat and ordered for 8 people. The meat was so tender it was falling off the bone. Rice was perfectly spiced, not too oily. Borhani was fresh and tangy. Service was a bit slow — we waited almost 40 minutes but I think it was because it was a Friday evening and the place was packed. Ambience is simple, nothing fancy, but for the food quality the price is very fair. Taste 5/5 all day. Will keep coming back." }),
    rev(rina._id,  r1._id, { title:'Firni review', rating:5,
      ratings:{taste:5,hygiene:4,service:4,ambience:3,value:5},
      dishReviews:dr(['Firni',5,'Cold, smooth, perfectly sweetened — served in clay pots']),
      content:'The firni here is served in clay pots and it is cold, smooth, and perfectly sweetened. Nothing like the versions you get at other places. A must-order.' }),
    rev(ahmed._id, r1._id, { title:'Best kacchi in Dhanmondi, no contest', rating:5,
      ratings:{taste:5,hygiene:4,service:4,ambience:3,value:5}, likeCount:12,
      dishReviews:dr(['Kacchi Biriyani (Beef)',5,'Never dropped in 8 years'],['Borhani',5,'Freshly churned, tangy in exactly the right way'],['Naan',4,'Soft, pulled apart perfectly']),
      content:"Been coming here for 8 years and the quality has never dropped. Ordered the beef kacchi with borhani — the borhani was freshly churned and tangy in exactly the right way. The naan was soft and pulled apart perfectly. Slight wait at the counter but that is expected on a weekend. For this price point there is truly nothing better in the area." }),
    rev(jasim._id, r1._id, { title:'A Dhaka institution, period', rating:5,
      ratings:{taste:5,hygiene:4,service:4,ambience:4,value:5}, likeCount:22,
      dishReviews:dr(['Kacchi Biriyani (Mutton)',5,'Fat renders into the rice beautifully'],['Roasted Leg Piece',5,'Incredibly juicy'],['Shahi Tukra',4,'Properly soaked, not too sweet']),
      content:"Third time this month and I regret nothing. The mutton kacchi is slightly better than the beef in my opinion — the fat renders into the rice beautifully. Roasted leg piece was incredibly juicy. Shahi tukra to finish — properly soaked, not too sweet. The place has character, the kind you cannot manufacture." }),
    rev(farhan._id,r1._id, { title:'Honestly overrated in my opinion', rating:3,
      ratings:{taste:3,hygiene:2,service:2,ambience:2,value:3},
      dishReviews:dr(['Kacchi Biriyani (Beef)',3,'Decent but had better in Narinda'],['Firni',4,'The one item worth coming back for']),
      content:"Honestly overrated in my opinion. The biriyani was decent but I have had better in Narinda. The place smells a bit and the tables could be cleaner. Staff was not very attentive. The firni was good though, I will give them that. Probably will not rush back." }),
    rev(kabir._id, r1._id, { title:'Value for money king of Dhaka', rating:4,
      ratings:{taste:4,hygiene:3,service:3,ambience:2,value:5},
      dishReviews:dr(['Kacchi Biriyani (Beef)',4,'Real meat, proper spices at 380 taka']),
      content:"For 380 taka you are getting a full meal with real meat and proper spices. Cannot argue with the value. The place is busy and a bit crowded on weekends but that is part of the experience honestly." }),
    rev(mitu._id,  r1._id, { title:'Great food, rough seating', rating:4,
      ratings:{taste:5,hygiene:3,service:3,ambience:2,value:4},
      dishReviews:dr(['Kacchi Biriyani (Beef)',5,'Genuinely excellent kacchi']),
      content:"The kacchi itself is genuinely excellent. My issue is the seating — if you are a group of 6 you basically have to fight for space on a Friday. But nobody is going to Kacchi House for the ambience are they. Taste 5 stars always." }),
    rev(nadia._id, r1._id, { title:'Borhani alone is worth the trip', rating:4,
      ratings:{taste:4,hygiene:3,service:3,ambience:3,value:5},
      dishReviews:dr(['Borhani',5,'Properly spiced and chilled, nothing like bottled'],['Firni',4,'Worth visiting for this alone']),
      content:"I am not a biriyani person but my husband is obsessed with this place. I went for the borhani and the firni and honestly those two items alone are worth visiting for. The borhani is properly spiced and chilled, nothing like the bottled versions." }),
    rev(priya._id, r1._id, { title:'Solid traditional biriyani', rating:4,
      dishReviews:dr(['Kacchi Biriyani (Beef)',4,'Lived up to the hype']),
      content:"First time visiting, ordered the beef kacchi based on recommendations. It lived up to the hype — tender meat, fragrant rice. A bit oily for my taste but that is kacchi for you. Will come back." }),
    rev(rakib._id, r1._id, { title:'The original Dhanmondi spot', rating:5,
      ratings:{taste:5,hygiene:4,service:4,ambience:3,value:5},
      dishReviews:dr(['Kacchi Biriyani (Mutton)',5,'Recipe unchanged, nothing to improve']),
      content:"My family has been eating here since I was a child. Nothing about the recipe has changed and that is exactly the point. Some places stay the same because they cannot improve. This place stays the same because there is nothing to improve." }),
    rev(sonia._id, r1._id, { title:'Favourite biriyani always', rating:5,
      dishReviews:dr(['Kacchi Biriyani (Beef)',5,'Cannot fault it'],['Morog Polao',4,'Excellent if you want something lighter']),
      content:"Cannot fault the kacchi here. Morog polao is also excellent if you want something a bit lighter. Staff were helpful when I asked about portion sizes for a large group. Will be back for Eid inshallah." }),
    rev(kabir._id, r1._id, { title:'Late night kacchi hits different', rating:4,
      dishReviews:dr(['Beef Rezala',4,'Underrated combo with naan'],['Naan',4,'Soft and fresh even at 10pm']),
      content:"Came at 10pm on a Thursday and the food was still fresh and piping hot. The beef rezala with naan is an underrated combo. Not as crowded at night which is a bonus if you hate the rush." }),
    rev(jasim._id, r1._id, { title:'Mutton vs Beef — my verdict', rating:5,
      dishReviews:dr(['Kacchi Biriyani (Mutton)',5,'Edges beef on flavour'],['Kacchi Biriyani (Beef)',4,'Better value, 40 taka cheaper']),
      content:"After trying both multiple times: mutton kacchi edges it for flavour but beef kacchi has better value. The price difference is 40 taka and in my opinion the mutton is 40 taka better. Go mutton." }),
    rev(farhan._id,r1._id, { title:'The firni redeems everything', rating:3,
      dishReviews:dr(['Firni',5,'Perfectly chilled, light, not overly sweet']),
      content:"Food is fine but nothing exceptional to me. The firni in clay pots is genuinely special though — perfectly chilled, light, and not overly sweet. That one item I would come back for specifically." }),
    rev(ahmed._id, r1._id, { title:'Catering order was perfect', rating:5,
      dishReviews:dr(['Kacchi Biriyani (Beef)',5,'Every single person at the event praised it']),
      content:"Ordered for a family event of 20 people. They handled it smoothly, food arrived on time and was still warm. Every single person praised the biriyani. The confirmation process was easy and the staff were responsive on the phone." }),
    rev(rina._id,  r1._id, { title:'Roasted leg piece is underrated', rating:5,
      dishReviews:dr(['Roasted Leg Piece',5,'Deeply spiced, crispy skin, juicy inside — criminal value at 350 taka']),
      content:"Everyone talks about the kacchi but the roasted leg piece is secretly the best item here. Deeply spiced, crispy skin, juicy inside. 350 taka for a whole leg. Absolutely criminal value." }),

    // ── Gulshan Grill (r2) ─────────────────────────────────────────────────
    rev(ahmed._id, r2._id, { title:'Premium done right — worth every taka', rating:5,
      ratings:{taste:5,hygiene:5,service:5,ambience:5,value:4}, likeCount:20,
      dishReviews:dr(['Ribeye Steak 300g',5,'Cooked perfectly medium rare, beautifully charred'],['Mixed Grill Platter',5,'Worth every taka sharing between two'],['Garlic Bread',5,'Incredible from the wood-fired oven'],['Chocolate Lava Cake',5,'A 10/10 ending']),
      content:"This place is premium and you feel it the moment you walk in. Came for a work dinner. The ribeye was cooked perfectly medium rare, beautifully charred outside. The mixed grill platter is worth every taka if you are sharing between two. Service was excellent — our waiter knew the menu really well and suggested the garlic bread which was incredible. Slightly expensive but completely justified for the quality and setting. The chocolate lava cake was a 10/10 ending." }),
    rev(nadia._id, r2._id, { title:'Best steak in Dhaka by far', rating:5,
      ratings:{taste:5,hygiene:5,service:5,ambience:5,value:4},
      dishReviews:dr(['Ribeye Steak 300g',5,'Proper charcoal grill marks, cooked exactly as requested'],['Caesar Salad',5,'Fresh dressing made in house']),
      content:"The ribeye here is hands down the best I have had in Dhaka. Proper charcoal grill marks, seasoned well, cooked exactly as requested. The Caesar salad is fresh and the dressing is made in house. The outdoor seating area in the evening is beautiful — fairy lights and the smell of charcoal. Expensive but it is a proper fine dining experience." }),
    rev(jasim._id, r2._id, { title:'Splurge-worthy for special occasions', rating:5,
      ratings:{taste:5,hygiene:5,service:5,ambience:5,value:3},
      dishReviews:dr(['BBQ Chicken Half',5,'Juicy, charred, with a house marinade'],['Loaded Fries',4,'Addictive']),
      content:"Came here for my anniversary. The staff knew it was special and brought out a complimentary dessert at the end which was a lovely touch. The BBQ chicken half is surprisingly good for the price — juicy, charred, with a house marinade. The loaded fries are addictive. Overall exceptional experience, just expensive." }),
    rev(kabir._id, r2._id, { title:'Overpriced for what it is', rating:3,
      ratings:{taste:3,hygiene:4,service:3,ambience:4,value:2},
      dishReviews:dr(['Ribeye Steak 300g',3,'Good but not Wagyu at 1800 taka'],['BBQ Chicken Half',4,'The sweet spot value item']),
      content:"Look, the food is good. But 1800 taka for a steak that is not Wagyu is hard to justify in Dhaka. The BBQ chicken half at 750 is the sweet spot value-wise. The ambience is nice but you are paying a 40% Gulshan premium for it. For the price I expected more from the service — waiter disappeared for 20 minutes at one point." }),
    rev(rina._id,  r2._id, { title:'Mixed grill platter is the move', rating:4,
      ratings:{taste:5,hygiene:5,service:4,ambience:5,value:3},
      dishReviews:dr(['Mixed Grill Platter',5,'Multiple cuts, excellent variety'],['Garlic Bread',5,'Genuinely exceptional from wood-fired oven'],['Chocolate Lava Cake',4,'Warm and gooey, perfect']),
      content:"Came with a colleague and we shared the mixed grill platter. Absolutely the right call — you get to try multiple cuts and the variety is excellent. The garlic bread from the wood-fired oven is genuinely exceptional. Chocolate lava cake was warm and gooey, perfect. The bill was high but for the quality you can see where every taka goes." }),
    rev(farhan._id,r2._id, { title:'Nice but I expected more', rating:3,
      ratings:{taste:3,hygiene:4,service:3,ambience:4,value:2},
      dishReviews:dr(['Ribeye Steak 300g',3,'Good but not revelatory'],['Garlic Bread',4,'Probably the highlight'],['Mushroom Soup',2,'Too salty']),
      content:"The reputation had me expecting something transcendent. The steak was good but not revelatory. Garlic bread was probably the highlight. The mushroom soup was too salty. Ambience is genuinely nice for a date night though." }),
    rev(mitu._id,  r2._id, { title:'Perfect for a business dinner', rating:4,
      dishReviews:dr(['Mixed Grill Platter',4,'Ideal for sharing, impresses clients']),
      content:"Took a client here and was impressed by how professional the service was. Food came out on time, presented well, staff were knowledgeable. The mixed grill platter is ideal for sharing and impresses clients. Not cheap but the experience is reliable." }),
    rev(sonia._id, r2._id, { title:'Chocolate lava cake alone is worth visiting', rating:4,
      ratings:{taste:4,hygiene:5,service:4,ambience:5,value:3},
      dishReviews:dr(['Chocolate Lava Cake',5,'With vanilla ice cream, absolutely everything'],['Mango Sorbet',4,'Refreshing and clean']),
      content:"The desserts here deserve their own review. The chocolate lava cake with vanilla ice cream is everything. The mango sorbet is refreshing. Came specifically for dessert after dinner elsewhere and was not disappointed. The ambience at night is beautiful." }),
    rev(priya._id, r2._id, { title:"Dhaka's finest outdoor dining experience", rating:5,
      dishReviews:dr(['Grilled Fish Fillet',5,'Beautifully cooked'],['Caesar Salad',4,'Crisp and properly dressed']),
      content:"From the moment you walk in you feel the quality. The grilled fish fillet was beautifully cooked and the Caesar salad was crisp and properly dressed. The outdoor seating with the grill smoke in the air creates an incredible atmosphere. Worth every taka for a special evening." }),
    rev(rakib._id, r2._id, { title:'Reliable quality every visit', rating:4,
      dishReviews:dr(['Ribeye Steak 300g',4,'Generally excellent, varies slightly by chef'],['Garlic Bread',5,'Non-negotiable every visit']),
      content:"Third visit here, always consistent. The ribeye varies slightly with the chef on duty but generally excellent. The garlic bread is non-negotiable every time. Service can be slow when full but they handle it gracefully." }),
    rev(kabir._id, r2._id, { title:'Friday Night BBQ event review', rating:5,
      dishReviews:dr(['BBQ Chicken Half',5,'Watch it being cooked live'],['Mixed Grill Platter',5,'Unlimited sides, excellent value']),
      content:"Attended the Friday Night BBQ event last week. The live grilling setup is spectacular — you can watch your meat being cooked. Unlimited sides with the event pass is excellent value at 2500 taka. DJ was surprisingly good. Will book again for the next one." }),
    rev(jasim._id, r2._id, { title:'BBQ chicken is criminally underrated here', rating:5,
      dishReviews:dr(['BBQ Chicken Half',5,'750 taka for perfection — best value on the menu']),
      content:"Everyone talks about the steak but the BBQ chicken half is seriously exceptional. 750 taka for a perfectly grilled half chicken with that char and marinade? That is the best value item on the menu. Do not sleep on it." }),
    rev(ahmed._id, r2._id, { title:'Lemon Fresh is elite', rating:4,
      dishReviews:dr(['Fresh Lemonade',5,'Ginger, mint, lemon perfectly balanced — best value at 180 taka']),
      content:"Small note but the fresh lemonade here is extraordinary. Ginger, mint, and lemon perfectly balanced. It is the palate cleanser you need between heavy grill courses. And at 180 taka it is one of the best value items on the menu." }),
    rev(nadia._id, r2._id, { title:'Mango sorbet is seasonal perfection', rating:4,
      dishReviews:dr(['Mango Sorbet',5,'Pure clean mango with a hint of tartness']),
      content:"The mango sorbet is genuinely one of the best desserts I have had in Dhaka. Pure, clean mango flavour with a hint of tartness. If they offered this year-round I would come just for it." }),
    rev(rina._id,  r2._id, { title:'Caesar salad: actually good', rating:4,
      dishReviews:dr(['Caesar Salad',4,'Real dressing not bottled, fresh croutons, proper Parmesan']),
      content:"I usually avoid salads at Bangladeshi restaurants because they are an afterthought. Here the Caesar is properly made — real dressing not bottled, fresh croutons, proper Parmesan. A small triumph." }),

    // ── Puran Dhaka Bhojon (r3) ────────────────────────────────────────────
    rev(jasim._id, r3._id, { title:'This is what tehari is supposed to taste like', rating:5,
      ratings:{taste:5,hygiene:3,service:4,ambience:4,value:5}, likeCount:31,
      dishReviews:dr(['Mutton Tehari',5,'Extraordinary — spiced perfectly, portions huge'],['Bakarkhani',5,'Fresh from the tawa, a time machine']),
      content:"If you have not eaten tehari in Old Dhaka you have not really eaten tehari. This place is the real thing. Sitting on those wooden benches, the smell of ghee in the air, bakarkhani fresh from the tawa. This is not a restaurant it is a time machine. Mutton tehari was extraordinary — spiced perfectly, portions huge, price almost criminal in how cheap it is. Hygiene is old school, do not expect sanitiser dispensers but the kitchen is clean. A Dhaka institution." }),
    rev(ahmed._id, r3._id, { title:'The bakarkhani alone is worth the trip to Old Dhaka', rating:5,
      ratings:{taste:5,hygiene:3,service:4,ambience:4,value:5}, likeCount:15,
      dishReviews:dr(['Bakarkhani',5,'Freshly made, layered, slightly flaky — 20 taka, criminal'],['Beef Tehari',5,'Proper Old Dhaka style with the right amount of ghee']),
      content:"Nobody talks about the bakarkhani at Puran Dhaka Bhojon and that is genuinely a crime. Freshly made, layered, slightly flaky, pairs perfectly with the beef bhuna. 20 taka for something this good. The beef tehari is also outstanding — proper Old Dhaka style with the right amount of ghee. This is what food memories are made of." }),
    rev(farhan._id,r3._id, { title:'Old Dhaka food tour essential stop', rating:5,
      ratings:{taste:5,hygiene:3,service:4,ambience:4,value:5},
      dishReviews:dr(['Mutton Tehari',5,'Depth of flavour modern biriyani places cannot replicate'],['Dal',4,'With naan roti — perfect simple combination']),
      content:"Part of my extended Old Dhaka food tour and this was the highlight. The mutton tehari has a depth of flavour that modern biriyani places cannot replicate. The setting is rustic — wooden benches, no AC — but that adds to the authenticity. Dal with naan roti was a perfect simple combination." }),
    rev(rina._id,  r3._id, { title:'The shahi halwa is incredible', rating:5,
      ratings:{taste:5,hygiene:3,service:3,ambience:3,value:5},
      dishReviews:dr(['Shahi Halwa',5,'Rich, dense, fragrant with cardamom and saffron — huge portion for 80 taka']),
      content:"Came specifically for dessert after exploring Chawkbazar. The shahi halwa is made fresh and the portion is huge for 80 taka. Rich, dense, fragrant with cardamom and saffron. The firni in clay pots was equally excellent. This place for traditional sweets is unmatched." }),
    rev(kabir._id, r3._id, { title:'Beef tehari vs mutton tehari: both perfect', rating:5,
      ratings:{taste:5,hygiene:3,service:4,ambience:3,value:5},
      dishReviews:dr(['Mutton Tehari',5,'Wins on flavour complexity'],['Beef Tehari',5,'Wins on texture and value at 180 taka']),
      content:"Ordered both to compare. Honest verdict: mutton wins on flavour complexity, beef wins on texture and value. At 180 and 220 taka respectively these are some of the most fairly priced meals in Dhaka. The borhani here is thicker and tangier than at the biriyani places." }),
    rev(mitu._id,  r3._id, { title:"I don't normally eat Old Dhaka food but this converted me", rating:4,
      ratings:{taste:4,hygiene:3,service:3,ambience:3,value:5},
      dishReviews:dr(['Beef Tehari',4,'Fragrant, rich, well-seasoned — converted me instantly'],['Bakarkhani',4,'Never tried before, soft inside, slightly crisp outside']),
      content:"A friend dragged me here and I was not enthusiastic about the setting. But after one bite of the beef tehari I understood. Fragrant, rich, well-seasoned. The bakarkhani was something I had never tried before and it was genuinely lovely — soft inside, slightly crisp outside." }),
    rev(nadia._id, r3._id, { title:'Firni in clay pots is a must', rating:4,
      ratings:{taste:4,hygiene:3,service:3,ambience:3,value:5},
      dishReviews:dr(['Roasted Chicken',4,'Straightforward but excellently spiced'],['Shahi Halwa',4,'Star of the dessert section']),
      content:"The food here is simple and honest. No pretension, no overpriced cocktails. The roasted chicken is straightforward but excellently spiced. The firni served in small clay pots is the star of the dessert section — cold, creamy, and perfectly sweetened." }),
    rev(sonia._id, r3._id, { title:'Best value in Dhaka full stop', rating:5,
      dishReviews:dr(['Mutton Tehari',5,'220 taka — would cost 4x in Gulshan'],['Shahi Halwa',4,'80 taka treasure']),
      content:"220 taka for mutton tehari in Old Dhaka. 80 taka for shahi halwa that would cost 400 taka in Gulshan. This place is a treasure and I genuinely worry about it getting discovered by food influencers and prices going up." }),
    rev(priya._id, r3._id, { title:'Worth the journey to Old Dhaka', rating:4,
      dishReviews:dr(['Dal',4,'Deceptively simple, deeply satisfying'],['Beef Tehari',4,'Reheated perfectly the next day']),
      content:"Getting to Chawkbazar during Dhaka traffic is itself a commitment but this place makes it worth it. The dal with naan roti is deceptively simple and deeply satisfying. Ordered the beef tehari to take home and it reheated perfectly the next day." }),
    rev(rakib._id, r3._id, { title:'The last honest meal in Dhaka', rating:5,
      dishReviews:dr(['Beef Tehari',5,'Recipe unchanged in 40 years — reminder of what food should be']),
      content:"In a city full of restaurants charging 1500 taka for a steak, this place charges 180 taka for a meal that will make you emotional. The tehari recipe has not changed in 40 years and it should not. A visit here is a reminder of what food is supposed to be." }),
    rev(jasim._id, r3._id, { title:'Beef bhuna with naan: perfect lunch', rating:5,
      dishReviews:dr(['Beef Bhuna',5,'Properly reduced, deep spice profile, not swimming in oil'],['Naan Roti',4,'Perfect pairing under 250 taka total']),
      content:"The beef bhuna here is a dry curry done right — properly reduced, deep spice profile, not swimming in oil. With a couple of naans it is a perfect lunch for under 250 taka. Cannot ask for more." }),
    rev(farhan._id,r3._id, { title:'The atmosphere is the food', rating:4,
      dishReviews:dr(['Mutton Tehari',4,'Would taste different in a modern restaurant — authenticity is part of it']),
      content:"The wooden benches, the clay plates, the smell of ghee — half the experience here is the setting. The tehari would taste different in a modern restaurant. The combination of authenticity and flavour is what makes this place special." }),
    rev(ahmed._id, r3._id, { title:'Old Dhaka food tour guide essential', rating:5,
      dishReviews:dr(['Beef Tehari',5,'The base against which everything else is measured'],['Bakarkhani',5,'Stop here first on any food tour']),
      content:"If you are doing an Old Dhaka food tour, stop here first for tehari and bakarkhani, then walk to the sweet shops after. The order matters. The tehari here is the base against which everything else is measured." }),
    rev(kabir._id, r3._id, { title:'Roasted chicken is criminally underordered', rating:4,
      dishReviews:dr(['Roasted Chicken',4,'280 taka for a whole chicken — often sells out, order early']),
      content:"Everyone gets the tehari which is right, but the roasted chicken here is special — whole chicken, house spice rub, beautifully charred. 280 taka for a whole roasted chicken is extraordinary value. It often sells out so order early." }),
    rev(nadia._id, r3._id, { title:'Borhani vs kacchi house borhani: this wins', rating:4,
      dishReviews:dr(['Beef Tehari',4,'Honest and fairly priced'],['Mutton Tehari',4,'Thicker, tangier — the standard bearer']),
      content:"Controversial opinion but the borhani at Puran Dhaka Bhojon is better than at any of the famous biriyani places. Thicker, tangier, more complex spice profile. 40 taka for a glass that will make you want another immediately." }),

    // ── Sakura Japanese Kitchen (r4) ──────────────────────────────────────
    rev(farhan._id,r4._id, { title:'Most authentic Japanese in Dhaka', rating:5,
      ratings:{taste:5,hygiene:5,service:5,ambience:5,value:3}, likeCount:14,
      dishReviews:dr(['Salmon Sashimi (6 pcs)',5,'Genuinely fresh, not frozen and thawed'],['Tonkotsu Ramen',5,'18+ hours of simmering — you taste the commitment'],['Gyoza (6 pcs)',5,'Perfect crisp-to-soft ratio']),
      content:"After visiting Japan twice I was skeptical about Japanese food in Dhaka. Sakura changed my mind completely. The salmon sashimi is fresh — genuinely fresh, not frozen and thawed. The tonkotsu ramen broth has depth that you only get from 18+ hours of simmering. You taste the commitment. The gyoza has the perfect crisp-to-soft ratio. Expensive by Dhaka standards but worth every taka for proper Japanese food." }),
    rev(nadia._id, r4._id, { title:'Is the Omakase worth 4500 taka? Yes.', rating:5,
      ratings:{taste:5,hygiene:5,service:5,ambience:5,value:4},
      dishReviews:dr(['Salmon Sashimi (6 pcs)',5,'Nine courses of meticulously crafted food'],['Matcha Ice Cream',5,'Deep green, real Uji matcha — the real thing']),
      content:"Attended the Omakase evening last month. Nine courses of meticulously crafted Japanese food. The head chef explained each dish and the sake pairing suggestions were excellent. It is an experience not just a meal. 4500 taka in Dhaka terms is significant but you are getting something completely unique. Yes it is worth it." }),
    rev(rakib._id, r4._id, { title:'Dragon roll is the star of the menu', rating:4,
      ratings:{taste:4,hygiene:5,service:4,ambience:4,value:3},
      dishReviews:dr(['Dragon Roll (8 pcs)',4,'Prawn tempura perfectly crispy, spicy mayo just right'],['Matcha Ice Cream',5,'Quality matcha, not flavouring']),
      content:"The dragon roll is exceptional — the prawn tempura inside is perfectly crispy and the spicy mayo has exactly the right heat level. The matcha ice cream is genuinely impressive, clearly made with quality matcha not flavouring. Pricey but you can see where the money goes." }),
    rev(jasim._id, r4._id, { title:"Ramen that passes the Japan test", rating:5,
      ratings:{taste:5,hygiene:5,service:4,ambience:4,value:3},
      dishReviews:dr(['Tonkotsu Ramen',5,'Closest approximation to Fukuoka outside Japan']),
      content:"I have eaten tonkotsu ramen in Fukuoka so I know what the real thing tastes like. This is the closest approximation I have found outside Japan. The broth is genuinely complex, the noodles have the right chew, and the toppings are authentic. For Dhaka this is exceptional." }),
    rev(ahmed._id, r4._id, { title:'Best hygiene standards in the city', rating:4,
      ratings:{taste:4,hygiene:5,service:4,ambience:4,value:3},
      dishReviews:dr(['Salmon Sashimi (6 pcs)',4,'Freshness incomparable in Dhaka'],['Chicken Katsu Curry',4,'The approachable gateway dish']),
      content:"Left a couple of stars off because of the price but the quality is undeniable. The kitchen is spotless — you can see it through the glass partition. The sashimi freshness is incomparable in Dhaka. The chicken katsu curry is the approachable gateway dish if you are new to Japanese food." }),
    rev(mitu._id,  r4._id, { title:'Gyoza here is the best in Bangladesh', rating:5,
      ratings:{taste:5,hygiene:5,service:4,ambience:4,value:3},
      dishReviews:dr(['Gyoza (6 pcs)',5,'Exact right thickness, perfectly seasoned, crispy bottom without grease']),
      content:"I have made it my mission to eat the gyoza at every restaurant in Dhaka claiming to serve Japanese food. Sakura wins by a significant margin. The skin has the exact right thickness, the filling is seasoned perfectly, and the crispy bottom is achieved without being greasy." }),
    rev(priya._id, r4._id, { title:'First Japanese food experience — now obsessed', rating:4,
      dishReviews:dr(['Chicken Katsu Curry',4,'Excellent entry point into the cuisine'],['Miso Soup',4,'Perfect starter'],['Matcha Ice Cream',4,'A revelation']),
      content:"Came here for the first time not knowing what to expect. The staff were incredibly helpful in explaining the menu. Ordered the chicken katsu curry and the miso soup — both excellent entry points into the cuisine. The matcha ice cream was a revelation." }),
    rev(kabir._id, r4._id, { title:'Expensive but you understand why', rating:3,
      ratings:{taste:4,hygiene:5,service:3,ambience:4,value:2},
      dishReviews:dr(['Salmon Sashimi (6 pcs)',3,'Excellent quality but 980 taka for 6 pieces is steep']),
      content:"The food quality is genuinely excellent and the hygiene is the best of any restaurant I have visited. But 980 taka for 6 pieces of sashimi is hard to accept when I can get a full meal elsewhere for 250 taka. A special occasion place only for me." }),
    rev(sonia._id, r4._id, { title:'The edamame is a mood', rating:4,
      dishReviews:dr(['Edamame',4,'Properly seasoned, not overcooked — the simplest things reveal the kitchen']),
      content:"Simple thing but the edamame here is perfect — properly seasoned, not overcooked, served hot. Sometimes the simplest things reveal the most about a kitchen. 220 taka for a snack is steep but the quality is there." }),
    rev(farhan._id,r4._id, { title:'Omakase waitlist is worth joining', rating:5,
      dishReviews:dr(['Dragon Roll (8 pcs)',5,'Should have its own Wikipedia page']),
      content:"Just got off the waitlist for the next Omakase evening. Based on what friends have said this is going to be a once-in-a-year type experience. The regular menu alone is exceptional — the Dragon Roll should have its own Wikipedia page." }),
    rev(rakib._id, r4._id, { title:'Tonkotsu ramen has replaced my regular place', rating:5,
      dishReviews:dr(['Tonkotsu Ramen',5,'Depth of broth on another level, 680 taka worth every fil']),
      content:"Used to go to another ramen place in Banani. After trying Sakura once I cannot go back. The depth of the broth is on another level. The soft-boiled egg is perfectly marinated. Yes it costs 680 taka for a bowl but it is worth it for the once-a-week treat." }),
    rev(jasim._id, r4._id, { title:'Green tea is exceptional', rating:4,
      dishReviews:dr(['Green Tea',4,'Actual Sencha served properly, refilled twice — 150 taka']),
      content:"Small thing but worth noting — the green tea here is actual Sencha served properly, not a green tea bag in hot water. 150 taka for a proper pot of tea that is refilled twice. Little details like this make the difference." }),
    rev(nadia._id, r4._id, { title:'Matcha ice cream is a must-order', rating:5,
      dishReviews:dr(['Matcha Ice Cream',5,'Real Uji matcha, intense, slightly bitter, incredibly smooth']),
      content:"The matcha ice cream is made with real Uji matcha and you can taste the difference immediately. Intense, slightly bitter, incredibly smooth. The colour is that deep green that tells you it is the real thing. 280 taka for an ice cream sounds expensive until you taste it." }),
    rev(ahmed._id, r4._id, { title:'Service could improve but food is flawless', rating:4,
      dishReviews:dr(['Salmon Sashimi (6 pcs)',4,'World-class freshness by Dhaka standards'],['Tonkotsu Ramen',4,'When this is this good, service complaints fade']),
      content:"The food is genuinely world-class by Dhaka standards. My only note is that the service can be a bit stiff — not rude, just robotic. But when the sashimi is this fresh and the ramen is this good, it is hard to complain too seriously." }),
    rev(mitu._id,  r4._id, { title:'Cancelled booking refund was prompt', rating:4,
      dishReviews:dr(['Chicken Katsu Curry',4,'Would have had this — booking system works well']),
      content:"Had to cancel our reservation due to illness. The refund was processed within 5 days as promised and the staff were gracious about it. Good to know the booking system works properly even in the negative scenario." }),

    // ── Bella Napoli (r5) ──────────────────────────────────────────────────
    rev(nadia._id, r5._id, { title:"Dhaka's best Italian, no debate", rating:5,
      ratings:{taste:5,hygiene:5,service:5,ambience:5,value:4}, likeCount:16,
      dishReviews:dr(['Margherita Pizza',5,'Simple, clean, charred correctly at the edges'],['Spaghetti Carbonara',5,'Guanciale and egg yolk — proper technique'],['Tiramisu',5,'House-made and it shows']),
      content:"The wood-fired Neapolitan pizza here is the real deal. The margherita is perfect — simple, clean, charred correctly at the edges. The carbonara is made properly with guanciale and egg yolk, not cream. This is how Italian food should be cooked. The tiramisu is house-made and it shows. Slightly pricey but the imported ingredients justify it." }),
    rev(rina._id,  r5._id, { title:'The carbonara is the only carbonara in Dhaka', rating:5,
      ratings:{taste:5,hygiene:5,service:4,ambience:4,value:3},
      dishReviews:dr(['Spaghetti Carbonara',5,'The only authentic carbonara in Dhaka — guanciale and egg yolk, no cream']),
      content:"Every restaurant in Dhaka that claims to make carbonara puts cream in it which is wrong. Bella Napoli uses guanciale and egg yolk the way it is supposed to be made. 720 taka is expensive but for the only authentic carbonara in the city it is fair." }),
    rev(ahmed._id, r5._id, { title:'Pepperoni pizza with real Calabrese pepperoni', rating:5,
      ratings:{taste:5,hygiene:5,service:4,ambience:4,value:3},
      dishReviews:dr(['Pepperoni Pizza',5,'Imported Calabrese — spicy, thin, properly charred'],['Panna Cotta',5,'Silky with tart balanced berry compote']),
      content:"The pepperoni here is imported Calabrese — spicy, thin, properly charred at the edges from the wood-fired oven. Nothing like the generic stuff other places use. The panna cotta was silky and the berry compote was tart and balanced. A real Italian meal." }),
    rev(jasim._id, r5._id, { title:'Tiramisu worth every taka', rating:4,
      ratings:{taste:5,hygiene:5,service:4,ambience:4,value:3},
      dishReviews:dr(['Tiramisu',5,'Real Mascarpone, proper Savoiardi, balanced — my benchmark for Italian restaurants']),
      content:"I judge Italian restaurants by their tiramisu. Here it is made with real Mascarpone, proper Savoiardi biscuits, and not too much alcohol. Balanced, creamy, not overly sweet. The espresso-soaked biscuits had enough bitterness to offset the Mascarpone. Excellent." }),
    rev(farhan._id,r5._id, { title:'Good but pricey for Dhaka', rating:3,
      ratings:{taste:3,hygiene:5,service:3,ambience:4,value:2},
      dishReviews:dr(['Penne Arrabbiata',2,'Lacked the heat the name promises — pleasant but mild'],['Margherita Pizza',3,'Objectively high quality but hard to justify at 820 taka']),
      content:"The food is objectively high quality but 820 taka for a pizza and 720 for pasta is hard to justify when I can eat just as satisfyingly elsewhere for a quarter of the price. The Arrabbiata lacked heat for my taste. The ambience is pleasant but a bit tourist-trap-feeling." }),
    rev(mitu._id,  r5._id, { title:'Perfect date night restaurant', rating:5,
      ratings:{taste:5,hygiene:5,service:5,ambience:5,value:4},
      dishReviews:dr(['Margherita Pizza',5,'Deceptively simple and perfect'],['Panna Cotta',4,'The ideal romantic dessert with berry compote']),
      content:"Came here for an anniversary dinner. The staff arranged a candle on the table without being asked. The Margherita is deceptively simple and perfect. The panna cotta with berry compote was the ideal romantic dessert. The atmosphere in the evening with soft lighting is exceptional. Highly recommended for a special occasion." }),
    rev(kabir._id, r5._id, { title:'Bruschetta is an excellent starter', rating:4,
      dishReviews:dr(['Bruschetta',4,'Proper sourdough, aged balsamic — simple done well'],['Penne Arrabbiata',3,'Good pasta quality, San Marzano comes through']),
      content:"The bruschetta here uses proper sourdough and the aged balsamic is not the cheap stuff. Simple starter done well. The arrabbiata penne had good heat and the San Marzano tomatoes came through clearly. Overall honest Italian cooking." }),
    rev(sonia._id, r5._id, { title:'The best tiramisu outside Italy', rating:5,
      dishReviews:dr(['Tiramisu',5,'Top five I have had anywhere — worth the trip to Gulshan solely for this']),
      content:"Flew to Italy twice and eaten tiramisu at various places. The version here is in the top five I have ever had anywhere. The chef clearly knows the technique. Worth the trip to Gulshan solely for the dessert section." }),
    rev(priya._id, r5._id, { title:'Wonderful first Italian restaurant experience', rating:4,
      dishReviews:dr(['Bruschetta',4,'Great introduction'],['Margherita Pizza',4,'Thin charred crust unlike anything I had before'],['Tiramisu',4,'Perfect finish']),
      content:"First time trying proper Italian food and the staff guided me through the menu patiently. Started with bruschetta, had the margherita, finished with tiramisu. The pizza has a thin charred crust that I have not had before. Will be back to try the pasta." }),
    rev(rakib._id, r5._id, { title:'San Pellegrino detail matters', rating:4,
      dishReviews:dr(['Margherita Pizza',4,'Proper char, good mozz, fragrant basil'],['Tiramisu',4,'Sealed it as my Italian restaurant of choice']),
      content:"Small thing but they serve San Pellegrino in the original bottle at the correct temperature. These details add up. The Margherita pizza is beautiful — proper char, good mozz, fragrant basil. The tiramisu sealed it as my Italian restaurant of choice in Dhaka." }),
    rev(jasim._id, r5._id, { title:'Arrabbiata needs more arrabbiata', rating:3,
      dishReviews:dr(['Penne Arrabbiata',3,'Pleasant but should be angrier — needs proper chilli kick']),
      content:"The penne arrabbiata was good but lacked the heat the name promises. 'Arrabbiata' means angry in Italian — the dish should have a proper chilli kick. The version here is pleasant but mild. Good pasta quality though." }),
    rev(farhan._id,r5._id, { title:'Wood-fired crust is genuinely excellent', rating:4,
      dishReviews:dr(['Margherita Pizza',4,'Best wood-fired crust in Dhaka — leopard spots, slight chew']),
      content:"Whatever my complaints about the price, the wood-fired crust on the pizza is excellent. Charred correctly, leopard spots where the air pockets blistered, slight chew in the centre. If you are a pizza person this is the best crust in Dhaka." }),
    rev(nadia._id, r5._id, { title:'Second visit even better than first', rating:5,
      dishReviews:dr(['Spaghetti Carbonara',5,'Just as good as the first time — consistency is everything'],['Tiramisu',5,'Even better second visit — distinguishes genuine quality']),
      content:"Came back three weeks later and the consistency is what impressed me. The carbonara was just as good as the first time. The tiramisu was better — perhaps a new batch of Mascarpone. This is what distinguishes genuine quality from a lucky first visit." }),
    rev(ahmed._id, r5._id, { title:'The bruschetta starter is essential', rating:4,
      dishReviews:dr(['Bruschetta',4,'Perfectly toasted sourdough, fresh tomatoes, aged balsamic depth']),
      content:"Start every meal here with the bruschetta. The sourdough is perfectly toasted, the tomatoes are fresh, and the aged balsamic gives it depth. 380 taka for what is essentially a starter seems high but the quality explains it." }),
    rev(rina._id,  r5._id, { title:'Panna cotta: silky perfection', rating:5,
      dishReviews:dr(['Panna Cotta',5,'Exact right wobble, vanilla bean seeds throughout — technically accomplished']),
      content:"The panna cotta here has the exact right wobble — set but barely, silky on the palate, the vanilla bean seeds visible throughout. The berry compote is house-made and provides the necessary tartness. 380 taka for a dessert this technically accomplished is fair." }),

    // ── Mezban Street Kitchen (r6) ─────────────────────────────────────────
    rev(kabir._id, r6._id, { title:'Mezban at 11pm is the best version of itself', rating:5,
      ratings:{taste:5,hygiene:3,service:4,ambience:1,value:5}, likeCount:22,
      dishReviews:dr(['Fuchka (8 pcs)',5,'Freshly made shells, tamarind water perfectly balanced'],['Chicken Shawarma',5,'Best in Dhaka at 120 taka — garlic sauce heavy, wrap not dry'],['Chotpoti',5,'Proper depth of flavour']),
      content:"Mezban Street Kitchen at 11pm after a long day — unmatched. The fuchka shells are freshly made, the tamarind water is perfectly balanced between sour and spicy. The chicken shawarma at 120 taka is the best I have had in Dhaka — garlic sauce is heavy and the wrap is not dry. The chotpoti has proper depth of flavour. No seating is actually fine standing at the counter watching everything being made. This is street food in its purest form." }),
    rev(ahmed._id, r6._id, { title:'The chicken shawarma at 120 taka is unbeatable value', rating:5,
      ratings:{taste:5,hygiene:3,service:4,ambience:1,value:5},
      dishReviews:dr(['Chicken Shawarma',5,'Beats 350-400 taka competitors — marinated, generous garlic sauce, wrap not stale']),
      content:"I have tried shawarma at places charging 350-400 taka. The chicken shawarma at Mezban for 120 taka beats them all. The chicken is marinated and properly cooked, the garlic sauce is generous and fresh, the wrap is not stale. At this price this is criminal value." }),
    rev(jasim._id, r6._id, { title:'Fuchka standards are the highest in Mirpur', rating:5,
      ratings:{taste:5,hygiene:3,service:4,ambience:1,value:5},
      dishReviews:dr(['Fuchka (8 pcs)',5,'Thin crispy shells, properly spiced, tamarind water with black salt — 60 taka outstanding']),
      content:"Mirpur has many fuchka vendors but Mezban has the best in my opinion. The shells are thin and crispy, the filling is properly spiced, and the tamarind water is genuinely good — tart, spicy, with a hint of black salt. 60 taka for 8 pieces is outstanding." }),
    rev(rina._id,  r6._id, { title:'Late night street food at its finest', rating:4,
      ratings:{taste:4,hygiene:3,service:4,ambience:1,value:5},
      dishReviews:dr(['Jhalmuri',4,'Puffed rice with raw mustard oil — simple and perfect'],['Mango Lassi',4,'Thick and sweet, 40 taka for something this good']),
      content:"This is not a restaurant for sitting down and having a conversation — it is a standing counter where you eat fast and move on. And within those constraints it excels. The jhalmuri with raw mustard oil is simple and perfect. The mango lassi is thick and sweet. 40 taka for something this good is remarkable." }),
    rev(farhan._id,r6._id, { title:'Hygiene is the only concern', rating:3,
      ratings:{taste:4,hygiene:2,service:3,ambience:1,value:4},
      dishReviews:dr(['Beef Shawarma',4,'Best thing here — wish the hygiene matched the quality']),
      content:"The food tastes genuinely excellent but the hygiene situation could be better. I watched someone sneeze near the fuchka station without covering. The tamarind water quality is high — I just wish the cleanliness standards matched. The beef shawarma is the best thing here." }),
    rev(mitu._id,  r6._id, { title:'Chotpoti deserves its own restaurant', rating:5,
      ratings:{taste:5,hygiene:3,service:3,ambience:1,value:5},
      dishReviews:dr(['Chotpoti',5,'Best version anywhere — perfectly cooked chickpeas, sour spicy fragrant, crunch from onion']),
      content:"The chotpoti here is the best version of this dish I have had anywhere. The chickpeas are perfectly cooked, the spice balance is excellent — sour, spicy, fragrant — and the onion topping adds crunch. 80 taka for a bowl of this is why I still love Dhaka." }),
    rev(nadia._id, r6._id, { title:'A love letter to street food', rating:4,
      dishReviews:dr(['Fuchka (8 pcs)',4,'Made fresh in front of you, flavours honest'],['Egg Chop',4,'Properly made, not rushed']),
      content:"I grew up eating fuchka on the street and this place brings back that feeling. Everything is made fresh in front of you, the portions are generous for the price, and the flavours are honest. The egg chop here is properly made — not rushed." }),
    rev(sonia._id, r6._id, { title:'This review is flagged', rating:2, isFlagged:true, isPublished:false, isReported:true,
      dishReviews:[],
      content:"I found something concerning in my food here and I am flagging this for health reasons. [Content removed pending moderation review]" }),
    rev(priya._id, r6._id, { title:'My new late night spot in Mirpur area', rating:4,
      dishReviews:dr(['Chicken Shawarma',4,'Consistently excellent after-work ritual'],['Fresh Coconut Water',4,'Perfect cooldown at 60 taka']),
      content:"Newly moved to Mirpur and this has become my after-work ritual. The chicken shawarma is consistently excellent. The fresh coconut water at 60 taka is the perfect cooldown. The queue can be long but it moves fast." }),
    rev(rakib._id, r6._id, { title:'The aloo chop is underrated', rating:4,
      dishReviews:dr(['Aloo Chop',4,'Crispy coating, well-spiced filling, not greasy — 30 taka criminal value']),
      content:"Everyone gets the shawarma and fuchka but the aloo chop at 30 taka is seriously good — crispy coating, well-spiced potato filling, not greasy. Three of them for 90 taka is a snack that will satisfy you for hours." }),
    rev(jasim._id, r6._id, { title:'Beef shawarma slight edge over chicken', rating:5,
      dishReviews:dr(['Beef Shawarma',5,'More tender, richer spice profile — slight edge over chicken'],['Chicken Shawarma',4,'Both excellent, go beef if undecided']),
      content:"Tried both shawarmas on the same visit to compare. Beef shawarma at 140 taka has a slight flavour edge over the chicken — the beef is more tender and the spice profile is richer. Both are excellent. Go beef if you cannot decide." }),
    rev(kabir._id, r6._id, { title:'Late night is the time to visit', rating:5,
      dishReviews:dr(['Jhalmuri',5,'At 11pm with the night air — a Dhaka experience you cannot replicate']),
      content:"Visited at both 5pm and 11pm on different days. The 11pm version is better — everything is fresher somehow, the crowd is different, the vibe is perfect. The jhalmuri at that hour with the night air is a Dhaka experience you cannot replicate." }),
    rev(ahmed._id, r6._id, { title:'Mango lassi is genuinely excellent', rating:4,
      dishReviews:dr(['Mango Lassi',4,'Fresh mango, thick yoghurt, not overly sweet — perfect after spicy fuchka']),
      content:"A street food place serving genuinely good mango lassi at 70 taka. The mango is fresh, the yoghurt is thick, and it is not overly sweet. After spicy fuchka this is exactly what you need. Underrated item." }),
    rev(farhan._id,r6._id, { title:'Quick and honest street food', rating:4,
      dishReviews:dr(['Chicken Shawarma',4,'190 taka with lassi — one of the best value meals in the city'],['Mango Lassi',4,'The perfect pairing']),
      content:"No pretension, no overpricing, just honest Dhaka street food executed well. The chicken shawarma and a mango lassi for 190 taka total is one of the best value meals in the city." }),
    rev(nadia._id, r6._id, { title:'Coconut water as a palate cleanser', rating:4,
      dishReviews:dr(['Fresh Coconut Water',4,'Between spicy fuchka and shawarma — staff understand their menu']),
      content:"The fresh coconut water at 60 taka between spicy fuchka and a shawarma is a clever palate cleanser. The staff here clearly understand how their menu works together. Small detail, big difference." }),

    // ── The Healthy Bowl (r7) ─────────────────────────────────────────────
    rev(priya._id, r7._id, { title:'The Healthy Bowl changed how I eat in Dhaka', rating:5,
      ratings:{taste:4,hygiene:5,service:5,ambience:4,value:3}, likeCount:11,
      dishReviews:dr(['Classic Macro Bowl',5,'Quinoa, grilled chicken, roasted veggies — the calorie count helps enormously'],['Overnight Oats',4,'Best meal prep item I have found at a restaurant in Dhaka']),
      content:"I have been trying to eat healthier in Dhaka and it has been nearly impossible — every restaurant is either fried food or biriyani. The Healthy Bowl in Uttara is genuinely changing how I eat. The Classic Macro Bowl with quinoa, grilled chicken, and roasted veggies is excellent. The calorie counts on the menu help enormously for tracking. The overnight oats are the best meal prep item I have found at a restaurant in Dhaka." }),
    rev(mitu._id,  r7._id, { title:'Finally a restaurant that takes health seriously', rating:5,
      ratings:{taste:4,hygiene:5,service:5,ambience:4,value:3},
      dishReviews:dr(['Protein Power Bowl',5,'Brown rice, egg white, edamame, chickpea — full for hours, macros customisable'],['Green Detox Smoothie',4,'Not too sweet, genuinely refreshing']),
      content:"The Protein Power Bowl is my go-to now. Brown rice, egg white, edamame, chickpea — everything works together and keeps me full for hours. The staff can customise macros if you ask. The green detox smoothie is excellent — not too sweet, genuinely refreshing." }),
    rev(nadia._id, r7._id, { title:'Avocado toast that is actually worth it', rating:4,
      ratings:{taste:4,hygiene:5,service:4,ambience:4,value:3},
      dishReviews:dr(['Avocado Toast',4,'Good avocados, proper sourdough, perfectly poached egg — 320 taka fair'],['Acai Bowl',4,'Best breakfast in Uttara']),
      content:"I was skeptical of avocado toast in Dhaka — expecting imported avocados at tourist prices. The version here uses good avocados, proper sourdough, and the poached egg is perfectly done. 320 taka is fair for the quality. The acai bowl is the best breakfast in Uttara." }),
    rev(rakib._id, r7._id, { title:'Highest hygiene I have experienced in Dhaka', rating:4,
      ratings:{taste:4,hygiene:5,service:5,ambience:4,value:3},
      dishReviews:dr(['Classic Macro Bowl',4,'Food quality matches the cleanliness standards']),
      content:"The kitchen is visible and immaculate. Staff wear gloves during food prep. Tables are sanitised visibly between customers. If hygiene is your priority this is the place in Dhaka. The food quality matches the cleanliness standards." }),
    rev(jasim._id, r7._id, { title:'Decent but I want more flavour', rating:3,
      ratings:{taste:3,hygiene:5,service:4,ambience:3,value:3},
      dishReviews:dr(['Quinoa Salad',3,'Needed more flavour development — healthy does not have to mean bland'],['Green Detox Smoothie',4,'Excellent — proper fruit, no added sugar']),
      content:"Everything is clean and healthy but I kept wanting more seasoning. Healthy does not have to mean bland. The quinoa salad especially needed more flavour development. The smoothies are excellent though — proper fruit, no added sugar." }),
    rev(farhan._id,r7._id, { title:'The wraps are genuinely excellent', rating:4,
      ratings:{taste:4,hygiene:5,service:4,ambience:3,value:3},
      dishReviews:dr(['Grilled Chicken Wrap',4,'Properly marinated and grilled, mustard dressing has good kick — 380 taka fair']),
      content:"The grilled chicken wrap with multigrain bread and mustard dressing is my favourite item here. The chicken is properly marinated and grilled, not just steamed. The mustard dressing has a good kick. 380 taka for a proper healthy wrap is fair." }),
    rev(rina._id,  r7._id, { title:'Post-gym meal solved', rating:4,
      dishReviews:dr(['Protein Power Bowl',4,'Exactly the macros I need and it tastes good — the miracle'],['Green Detox Smoothie',4,'Not sweet, actually detoxing something']),
      content:"Found my post-gym meal. The Protein Power Bowl has exactly the macros I need and it tastes good which is the miracle. The staff will add extra protein for a small charge. The green smoothie is not sweet which means it is actually detoxing something." }),
    rev(ahmed._id, r7._id, { title:'Overnight oats are meal prep gold', rating:4,
      dishReviews:dr(['Overnight Oats',4,'Chia seeds properly swollen, fresh fruit, right texture — 280 taka weekly ritual']),
      content:"Discovered the overnight oats on a whim and now they are a weekly ritual. The chia seeds are properly swollen, the fruit is fresh, the oats have the right texture. 280 taka for a nutritious breakfast that I did not have to prepare is excellent." }),
    rev(sonia._id, r7._id, { title:'The acai bowl is a revelation', rating:5,
      dishReviews:dr(['Acai Bowl',5,'Properly toasted granola, thick acai base, seasonal fresh fruit — premium ingredients']),
      content:"Had my first acai bowl here and could not believe something this healthy could taste this good. The granola is properly toasted, the acai base is thick and not too sweet, the fresh fruit on top is seasonal. 450 taka seems steep but this is a premium ingredient." }),
    rev(kabir._id, r7._id, { title:'Not for me but I respect it', rating:3,
      dishReviews:dr(['Classic Macro Bowl',3,'Colleague obsessed — I respect the execution but it is not my food language']),
      content:"I am a biriyani and shawarma person so this place was never going to be my home. That said I respect the execution — everything is clean, fresh, and properly made. My colleague is obsessed with the Macro Bowl. Just not my food language." }),
    rev(priya._id, r7._id, { title:'Location in Uttara is a gap in the market', rating:5,
      dishReviews:dr(['Green Detox Smoothie',5,'Made to order, ingredient substitutions possible']),
      content:"There is genuinely nowhere else like this in Uttara. If you are health conscious in that area this is the only option and fortunately it is excellent. The smoothies are made to order and you can ask for ingredient substitutions." }),
    rev(mitu._id,  r7._id, { title:'Detox smoothie actually works', rating:4,
      dishReviews:dr(['Green Detox Smoothie',4,'Spinach, cucumber, ginger, lemon, apple — genuinely feel better after']),
      content:"I know 'detox' is largely marketing but the Green Detox Smoothie here — spinach, cucumber, ginger, lemon, apple — genuinely makes me feel better after drinking it. Probably psychological. Still worth 280 taka." }),
    rev(nadia._id, r7._id, { title:'Staff nutritional knowledge is impressive', rating:4,
      dishReviews:dr(['Protein Power Bowl',4,'Staff gave full breakdown from memory — healthy branding feels earned']),
      content:"Asked about protein content in the Macro Bowl and the staff gave me a detailed breakdown from memory. This level of nutritional knowledge is completely absent from other Dhaka restaurants. Makes the 'healthy' branding feel earned rather than just a label." }),
    rev(farhan._id,r7._id, { title:'Would be better with more spice options', rating:3,
      dishReviews:dr(['Grilled Chicken Wrap',3,'Well-made but leans mild — a chilli dressing option would help']),
      content:"The food is well-made but everything leans mild. A spice level option would make this more accessible to Dhaka palates without compromising the healthy angle. The wrap would benefit from a chilli dressing option." }),
    rev(rakib._id, r7._id, { title:'The Quinoa Salad is properly constructed', rating:4,
      dishReviews:dr(['Quinoa Salad',4,'Tri-colour quinoa, herbs, genuine lemon vinaigrette — care in the recipe']),
      content:"Quinoa salad in Dhaka usually means a sad bowl of boring grain. Here it is tri-colour quinoa, herbs, and a genuinely excellent lemon vinaigrette. You can taste the care in the recipe. 420 taka for a salad is a lot but this is premium ingredient territory." }),
  ]);
  console.log(`${reviews.length} reviews created`);

  // ── Owner responses on reviews ───────────────────────────────────────────
  // Rahim (Star Kacchi) responds to Farhan's critical review and Kabir's review
  const farhanKacchiReview = reviews.find(rv => rv.userId.toString() === farhan._id.toString() && rv.restaurantId.toString() === r1._id.toString());
  const kabirKacchiReview  = reviews.find(rv => rv.userId.toString() === kabir._id.toString()  && rv.restaurantId.toString() === r1._id.toString());
  // Sumaiya (Gulshan Grill) responds to a positive review
  const rinaGulshanReview  = reviews.find(rv => rv.restaurantId.toString() === r2._id.toString() && rv.rating === 5);
  const ownerResponseUpdates = [];
  if (farhanKacchiReview) ownerResponseUpdates.push(Review.findByIdAndUpdate(farhanKacchiReview._id, {
    ownerResponse: 'Thank you for your honest feedback. We hear your concerns about hygiene and have taken steps to improve our cleaning schedule. We hope to welcome you back for a better experience.',
    ownerResponseAt: daysAgo(1)
  }));
  if (kabirKacchiReview) ownerResponseUpdates.push(Review.findByIdAndUpdate(kabirKacchiReview._id, {
    ownerResponse: 'Thank you for your kind words! Glad the value for money came through. Our weekends are busy but we are always improving wait times.',
    ownerResponseAt: daysAgo(3)
  }));
  if (rinaGulshanReview) ownerResponseUpdates.push(Review.findByIdAndUpdate(rinaGulshanReview._id, {
    ownerResponse: 'Thank you so much! Your kind words about the ambience mean a lot to our team. We look forward to seeing you again soon.',
    ownerResponseAt: daysAgo(2)
  }));
  await Promise.all(ownerResponseUpdates);
  console.log('Owner responses added');

  // ── Recalculate restaurant and dish running totals ─────────────────────
  const restaurantList = [r1,r2,r3,r4,r5,r6,r7];
  const criteriaKeys = ['taste','hygiene','service','ambience','value'];
  for (const rest of restaurantList) {
    const restReviews = reviews.filter(rv => rv.restaurantId?.toString() === rest._id.toString() && rv.isPublished !== false);
    if (restReviews.length) {
      const avg = restReviews.reduce((s,rv) => s + rv.rating, 0) / restReviews.length;
      const criteriaAverages = {};
      for (const key of criteriaKeys) {
        const rvsWithKey = restReviews.filter(rv => rv.ratings?.[key] > 0);
        criteriaAverages[key] = rvsWithKey.length
          ? Math.round(rvsWithKey.reduce((s,rv) => s + (rv.ratings[key] || 0), 0) / rvsWithKey.length * 10) / 10
          : 0;
      }
      const verifiedReviewsCount = restReviews.filter(rv => rv.verifiedVisit || rv.isVerified).length;
      await Restaurant.findByIdAndUpdate(rest._id, {
        rating: Math.round(avg * 10) / 10,
        reviewsCount: restReviews.length,
        criteriaAverages,
        verifiedReviewsCount
      });
    }
  }

  // Dish running totals — aggregate from dishReviews sub-documents
  for (const dish of allDishes) {
    const dishRatings = [];
    reviews.forEach(rv => {
      const entry = rv.dishReviews?.find(d => d.dishId?.toString() === dish._id.toString());
      if (entry) dishRatings.push(entry.rating);
    });
    if (dishRatings.length) {
      const avg = dishRatings.reduce((s, r) => s + r, 0) / dishRatings.length;
      await Dish.findByIdAndUpdate(dish._id, {
        rating: Math.round(avg * 10) / 10,
        reviewsCount: dishRatings.length
      });
    }
  }
  console.log('Running totals recalculated');

  // ── Print summary ─────────────────────────────────────────────────────────
  console.log(`
========================================
FOOD TABS — SEED S1 COMPLETE
Sprint 1: Foundation, Search, Restaurant Profiles, Dish Reviews, Rating System, Photo Upload
========================================

TEST ACCOUNTS:

ADMIN
  Email:    admin@foodtabs.com
  Password: Admin@1234

OWNERS
  rahim@foodtabs.com    Owner@1234  → Star Kacchi House
  sumaiya@foodtabs.com  Owner@1234  → Gulshan Grill and Co
  tariq@foodtabs.com    Owner@1234  → Puran Dhaka Bhojon
  kenji@foodtabs.com    Owner@1234  → Sakura Japanese Kitchen
  lorenzo@foodtabs.com  Owner@1234  → Bella Napoli
  mizanur@foodtabs.com  Owner@1234  → Mezban Street Kitchen
  sara@foodtabs.com     Owner@1234  → The Healthy Bowl
  amir@foodtabs.com     Owner@1234  → Blue Ocean Seafood (pending verification)

CUSTOMERS
  ahmed@foodtabs.com    Customer@1234
  nadia@foodtabs.com    Customer@1234
  rina@foodtabs.com     Customer@1234
  farhan@foodtabs.com   Customer@1234
  mitu@foodtabs.com     Customer@1234
  kabir@foodtabs.com    Customer@1234
  sonia@foodtabs.com    Customer@1234
  rakib@foodtabs.com    Customer@1234
  priya@foodtabs.com    Customer@1234
  jasim@foodtabs.com    Customer@1234

WHAT YOU CAN TEST:
  Restaurant search     — search for "biriyani", "japanese", "healthy"
  Restaurant profiles   — view menus, ratings, criteria breakdowns
  Dish reviews          — each dish has its own rating from customer reviews
  Photo upload          — upload photos when writing a review
  Owner responses       — Rahim and Sumaiya have responded to reviews
  Rating system         — all 8 restaurants have aggregated ratings from real reviews
========================================
`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
