import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Dish from './models/Dish.js';
import Review from './models/Review.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';
import Vote from './models/Vote.js';
import Report from './models/Report.js';
import Favorite from './models/Favorite.js';
import SavedOrder from './models/SavedOrder.js';
import Event from './models/Event.js';
import EventBooking from './models/EventBooking.js';

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
  const collections = [
    'users','restaurants','dishes','reviews',
    'posts','comments','votes','reports',
    'favorites','savedorders','events','eventbookings'
  ];
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

  // ── Forum Posts ───────────────────────────────────────────────────────────
  const CATS = {
    BEST:   'Best in City',
    HIDDEN: 'Hidden Gems',
    BAD:    'Bad Experiences',
    ASK:    'Ask the Community',
    DEALS:  'Deals and Offers',
    HOOD:   'Neighbourhood Eats'
  };

  const [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20] = await Post.insertMany([
    // ── Best in City ──────────────────────────────────────────────────────────
    { userId:jasim._id, title:'My definitive ranking of Kacchi Biriyani in Dhaka after visiting 12 restaurants — Star Kacchi House is still number one and here is why',
      content:"I have been eating biriyani across Dhaka for the last two years and keeping notes. Visited 12 places total. Star Kacchi House on Road 7 Dhanmondi wins by a clear margin. The meat to rice ratio is better than anywhere else I tried. The spice blend is consistent — I have been four times and it tastes the same every visit which tells you the kitchen is disciplined. Second place for me is Fakruddin but their portions have gotten smaller. Third is the tehari at Puran Dhaka Bhojon which is a different category but deserves a mention. Everything else in the city is either overpriced or inconsistent. If you disagree, tell me where and I will go try it. I am not closed to being wrong.",
      category:CATS.BEST, likeCount:12, commentsCount:8, linkedRestaurantId:r1._id, linkedDishId:d('Kacchi Biriyani (Beef)')?._id, tags:['biriyani','ranking','star kacchi'] },
    { userId:rina._id, title:'Gulshan vs Dhanmondi for a proper dinner out — where is the better value for money right now',
      content:"I have been tracking this for a while because my husband and I eat out once a week and we rotate areas. Gulshan has better ambience without question. Gulshan Grill and Co specifically is one of the best dining experiences in the city if you want to feel like you are somewhere special. But value is a different conversation. For the same spend in Dhanmondi you get more food and honestly sometimes better food. The Kacchi at Star Kacchi House costs a fraction of what you pay at a Gulshan restaurant and the taste rating on this platform reflects that — taste scores in Dhanmondi are consistently higher than ambience scores in Gulshan. I think Gulshan wins for dates and special occasions. Dhanmondi wins for actual food quality per taka spent.",
      category:CATS.BEST, likeCount:10, commentsCount:5, linkedRestaurantId:r2._id, tags:['gulshan','dhanmondi','value','fine dining'] },
    { userId:farhan._id, title:'Old Dhaka food tour guide — go here in this order and thank me later',
      content:"I spent a Saturday doing a proper Old Dhaka food tour. No bookings, just showed up. Started at Puran Dhaka Bhojon at 7am for fresh bakarkhani and tea. The bakarkhani straight from the tawa with a glass of thick tea is a complete experience. By 10am walked to a nearby halwa shop. Lunch at Puran Dhaka Bhojon again for the mutton tehari — huge portions, extremely cheap. The tehari here is a different product from Dhanmondi biriyani. Less rich, more spiced, served fast. Afternoon walked around Chawkbazar market. Ended with firni from a roadside stall. Total spend for the entire day was under 700 BDT. I am critical of many restaurants but Old Dhaka is the one area where I have no complaints. The food is honest.",
      category:CATS.BEST, likeCount:13, commentsCount:6, linkedRestaurantId:r3._id, linkedDishId:d('Mutton Tehari')?._id, tags:['old dhaka','food tour','guide','puran dhaka'] },
    { userId:nadia._id, title:'Honest review of Dhaka\'s Japanese options — is Sakura Japanese Kitchen actually authentic or is it just the aesthetic',
      content:"I lived abroad for two years and ate a lot of real Japanese food. When I came back I was excited to try Sakura Japanese Kitchen in Banani. My verdict: it is the most authentic Japanese experience available in Dhaka right now, which is a low bar but they clear it by more than expected. The tonkotsu ramen broth is genuinely good — rich, fatty, properly seasoned. The salmon sashimi was fresh which is the most important thing and the hardest thing to guarantee in Dhaka. The dragon roll was slightly over-sauced which is a very common thing outside Japan. The miso soup was excellent. Matcha ice cream was a bit sweet but enjoyable. The main complaint is price — 980 BDT for 6 pieces of sashimi is a lot even by international standards. But if you want Japanese food in Dhaka this is your best option right now.",
      category:CATS.BEST, likeCount:8, commentsCount:4, linkedRestaurantId:r4._id, linkedDishId:d('Tonkotsu Ramen')?._id, tags:['japanese','sakura','authentic','comparison'] },
    // ── Hidden Gems ───────────────────────────────────────────────────────────
    { userId:ahmed._id, title:'Nobody is talking about the bakarkhani at Puran Dhaka Bhojon and it is a serious problem',
      content:"I went to Old Dhaka last month for the mutton tehari and almost as an afterthought ordered a bakarkhani because it was 20 BDT. I was not expecting much. It was one of the best bread experiences I have had in Dhaka. Crispy outside, slightly flaky inside, a faint sweetness. Goes perfectly with their beef bhuna or even just on its own with tea. This is a 20 BDT item that could be the star of the menu if it were better marketed. Most people who visit go straight for the tehari and miss it completely. If you have been to Puran Dhaka Bhojon and did not order the bakarkhani, you need to go back specifically for it.",
      category:CATS.HIDDEN, likeCount:11, commentsCount:5, linkedRestaurantId:r3._id, linkedDishId:d('Bakarkhani')?._id, tags:['puran dhaka','bakarkhani','hidden gem','old dhaka'] },
    { userId:priya._id, title:'The Healthy Bowl in Uttara is genuinely changing how I think about eating in Dhaka',
      content:"I was skeptical because clean eating restaurants in Dhaka have a history of being expensive, small portioned, and not actually that healthy when you look at what goes in the food. The Healthy Bowl in Uttara Sector 7 is different. They show calorie counts on every item which nobody in Dhaka does. The Classic Macro Bowl is 480 BDT and fills you completely. The Green Detox Smoothie is actually made from real ingredients — you can see them adding the spinach and cucumber. The Protein Power Bowl has enough protein to actually matter. I eat here three times a week now and I feel different. That sounds like marketing copy but I mean it genuinely. The price is fair for what it is and the hygiene is the cleanest I have seen in any Dhaka restaurant.",
      category:CATS.HIDDEN, likeCount:8, commentsCount:4, linkedRestaurantId:r7._id, linkedDishId:d('Classic Macro Bowl')?._id, tags:['healthy','uttara','clean eating'] },
    { userId:kabir._id, title:'Mezban Street Kitchen at 11pm after a long day — nothing else comes close',
      content:"I know people talk about the fancy restaurants and the proper sit-down places and that is fine. But sometimes after a long day all you want is a chicken shawarma standing on a street in Mirpur. Mezban Street Kitchen on Section 6 Mirpur 10 is open until 1am. The shawarma is 120 BDT for chicken, freshly made, not sitting under a heat lamp. The fuchka is 60 BDT for 8 pieces and they make the filling in front of you. The chotpoti is 80 BDT and the right amount of spicy. This is not a restaurant you go to for ambience. You stand, you eat, you leave. But the food is real and it is made fresh. Late night in Dhaka this is my default and it has not let me down once.",
      category:CATS.HIDDEN, likeCount:10, commentsCount:5, linkedRestaurantId:r6._id, linkedDishId:d('Chicken Shawarma')?._id, tags:['street food','mirpur','late night','mezban'] },
    // ── Bad Experiences ───────────────────────────────────────────────────────
    { userId:mitu._id, title:'Reserved a table, arrived on time, was told to wait 45 minutes — what is the point of reservations',
      content:"This did not happen at a Food Tabs restaurant so I am not naming the place. But I want to raise the issue generally. I made a reservation through a different platform, arrived exactly on time with two people, and was told the table was not ready and I should wait. 45 minutes later we were seated. No apology, no explanation, no discount. The reservation system exists to prevent exactly this. If restaurants are going to take reservations they need to actually honour them. The reason I now prefer booking through Food Tabs is that the reservation system here actually tracks slot capacity in real time. But I wanted to share this experience because it is a common problem in Dhaka dining and people should know to ask restaurants directly whether their reservation system is actually being managed.",
      category:CATS.BAD, likeCount:9, commentsCount:6, tags:['reservation','bad experience','booking'] },
    { userId:sonia._id, title:'Found something in my food at a restaurant — sharing my experience and asking how others handled similar situations',
      content:"I ordered street food last week and found something in it that should not have been there. I will not go into graphic detail. I am not naming the restaurant yet because I want to handle this properly. My question to the community is — what is the right process here? Do I report directly to the restaurant? Do I report to BSTI? Do I leave a review here? I felt sick afterwards and I am genuinely uncertain what the right steps are. I want other people to be warned but I also want to be fair and give the restaurant a chance to respond first.",
      category:CATS.BAD, likeCount:0, commentsCount:0, isFlagged:true, isPublished:false, isReported:true, tags:['report','food safety','health'] },
    { userId:rakib._id, title:'Experienced differential treatment at a restaurant based on appearance — want to know if others have had this',
      content:"I am going to be vague about the restaurant because I do not want this to become a pile-on without more context. But I went to a relatively upscale place in Gulshan and noticed that the service we received was noticeably different from the service given to a table near us who were dressed more formally. We were in casual clothes. The wait time for our order was significantly longer. The staff interaction was shorter and less attentive. When I asked for the bill it took 15 minutes. The table next to us got none of that. The food was good and I would not downgrade the food rating because of this. But the service rating is affected. Has anyone else experienced this in Dhaka restaurants? Is this worth leaving a review about?",
      category:CATS.BAD, likeCount:7, commentsCount:5, tags:['service','discrimination','gulshan'] },
    // ── Ask the Community ─────────────────────────────────────────────────────
    { userId:priya._id, title:'Best place to take parents for a birthday dinner in Gulshan — budget 5000 BDT for 4 people',
      content:"My parents are visiting from Chittagong for their anniversary. I want to take them somewhere special in Gulshan that is not too loud, has proper service, and is impressive without being pretentious. 5000 BDT for 4 people. Any suggestions? They eat all cuisine types so that is not a constraint. What matters most to them is atmosphere and attentive service. We had a bad experience at a place last year where the staff ignored us for 20 minutes. Do not want to repeat that.",
      category:CATS.ASK, likeCount:8, commentsCount:4, tags:['family','gulshan','birthday','recommendation'] },
    { userId:farhan._id, title:'Is the Omakase at Sakura actually worth 4500 BDT?',
      content:"I am seriously considering booking the Omakase Evening at Sakura Japanese Kitchen. 4500 taka per person is a significant number. I have read the reviews and they seem positive but I want real opinions from people who have actually done it. Is it genuinely a special experience or is it paying for the novelty of it being called omakase? Does the chef actually narrate each course? Are the portions adequate? And most importantly — is the fish actually fresh enough to justify the price at that format?",
      category:CATS.ASK, likeCount:8, commentsCount:3, linkedRestaurantId:r4._id, tags:['sakura','omakase','japanese','worth it'] },
    { userId:ahmed._id, title:'Late night biriyani after 11pm in Dhanmondi — any recommendations?',
      content:"I know Star Kacchi House closes at 11pm on weekdays. What are the options for a late night biriyani fix in Dhanmondi or nearby? Looking for quality not just availability. I have tried a few places that are open late but the biriyani is clearly from the afternoon batch that has been sitting. I want somewhere that is actually making fresh biriyani at that hour. Mirpur is not too far for me if the quality is there.",
      category:CATS.ASK, likeCount:9, commentsCount:4, tags:['biriyani','dhanmondi','late night','recommendation'] },
    { userId:mitu._id, title:'How do I know if a review is real or fake on this platform?',
      content:"I trust reviews here more than other platforms but I still wonder — how does the platform verify that reviewers actually visited? Is there any filtering for fake reviews? This matters a lot for booking decisions. I have been burned before on other platforms by restaurants with inflated ratings. The verified badge here seems meaningful but I want to understand the full picture. Are unverified reviews still trustworthy? What happens when a fake review is reported?",
      category:CATS.ASK, likeCount:10, commentsCount:4, tags:['reviews','trust','verification','platform'] },
    // ── Deals and Offers ──────────────────────────────────────────────────────
    { userId:kabir._id, title:'Gulshan Grill early bird discount on weekdays — someone told me about this?',
      content:"A friend mentioned that Gulshan Grill and Co has an early bird deal on weekdays before 7pm. Cannot find this information on their profile. Has anyone confirmed this? Would change my visiting strategy significantly. The ribeye at full price is 1800 BDT which is a lot for a regular Tuesday dinner. If there is a meaningful discount at that hour it changes the whole calculation for me.",
      category:CATS.DEALS, likeCount:6, commentsCount:3, linkedRestaurantId:r2._id, tags:['gulshan grill','deals','discount','early bird'] },
    { userId:rina._id, title:'Star Kacchi House doing family pack deals during Eid week',
      content:"Just confirmed with the staff — Star Kacchi House is offering family packs of 4 and 6 portions at a discounted rate during Eid week. No details yet on the exact pricing but they said announcements coming soon. The family pack last Eid was very good value. If you are planning an Eid dawat this is worth watching. I will update this post when the official pricing drops. They also said the Eid menu will include the Borhani and Firni as part of the pack which was not the case last year.",
      category:CATS.DEALS, likeCount:9, commentsCount:3, linkedRestaurantId:r1._id, tags:['star kacchi','eid','family pack','deals'] },
    { userId:jasim._id, title:'Which restaurants have loyalty programs or frequent visitor discounts?',
      content:"I eat out 4-5 times a week and would love to know which restaurants in Dhaka have any kind of loyalty system. Even a simple stamp card would be something. I spend a significant amount on food every month and it would be nice to get something back from the places I visit regularly. Does anyone know of restaurants on this platform that offer any form of return customer recognition? I am specifically looking for places in Dhanmondi and Gulshan.",
      category:CATS.DEALS, likeCount:7, commentsCount:4, tags:['loyalty','discount','regular customers','reward'] },
    // ── Neighbourhood Eats ────────────────────────────────────────────────────
    { userId:jasim._id, title:'Complete food map of Dhanmondi Road 7 area — everything worth trying in a 10-minute walk',
      content:"Spent a month systematically eating my way through Road 7 and surrounding streets. Star Kacchi House is the obvious anchor but there are supporting acts worth knowing. There is a fresh juice stall near the lake that is open from 5pm until midnight. There is a small bakery two lanes over that does excellent butter biscuits. There is a Chinese restaurant that seems unremarkable but has exceptional prawn fried rice. The full route takes about 10 minutes to walk and you can eat your way through it in a Saturday afternoon very affordably. Full breakdown below.",
      category:CATS.HOOD, likeCount:10, commentsCount:4, linkedRestaurantId:r1._id, tags:['dhanmondi','food map','road 7','neighbourhood'] },
    { userId:nadia._id, title:'Banani vs Gulshan 2 — which neighbourhood has better overall dining options right now?',
      content:"People argue about this endlessly. I have spent the last two months eating in both areas and have reached a conclusion. The answer is more nuanced than the usual Gulshan-wins take. Gulshan 2 wins on flagship restaurants — you have Gulshan Grill, Bella Napoli, and a handful of other premium options that simply do not exist in Banani. But Banani wins on density of good mid-range options. You can walk 5 minutes in Banani and find 10 decent places. In Gulshan 2 the good places are spread out and you need to know where to go. If I had to pick one area to eat in for a week I would pick Banani for variety and Gulshan 2 for occasion dining.",
      category:CATS.HOOD, likeCount:9, commentsCount:3, tags:['banani','gulshan','neighbourhood','comparison'] },
    { userId:kabir._id, title:'Mirpur 10 hidden food spots — a local guide from someone who actually lives here',
      content:"Born and raised in Mirpur. The food scene here is criminally underrated in Dhaka food discourse. Everyone talks about Gulshan and Dhanmondi. Let me tell you what you are missing. Mezban Street Kitchen is the obvious one now but there are things even locals overlook. There is a rooftop biriyani place on Section 11 that serves until 2am and has the cheapest beef biriyani in the city at 240 BDT. There is a halim shop on Section 2 that has been making the same recipe for 30 years and the consistency is remarkable. The Mirpur market area has a row of fruit stalls that sell fresh seasonal juice for 30 BDT. If you have not eaten in Mirpur you have missed a significant part of the Dhaka food story.",
      category:CATS.HOOD, likeCount:10, commentsCount:5, linkedRestaurantId:r6._id, tags:['mirpur','hidden gems','local guide','neighbourhood'] },
  ]);
  console.log('Forum posts created');

  // ── Comments ──────────────────────────────────────────────────────────────
  const commentData = [
    // Post 1 — Kacchi ranking (jasim)
    { parentId:p1._id, parentType:'Post', userId:ahmed._id,  likeCount:11, content:"Completely agree about the consistency point. I have been three times and it is the same every time. That is rare in Dhaka. The Borhani there is also underrated." },
    { parentId:p1._id, parentType:'Post', userId:farhan._id, likeCount:-2, content:"I think it is slightly overrated. The biriyani is good but the place smells and the tables are never fully clean. Food quality does not excuse hygiene." },
    { parentId:p1._id, parentType:'Post', userId:rina._id,   likeCount:10, content:"The hygiene comment is fair. It is not the cleanest place. But the food quality is genuinely exceptional. I take my family there for special occasions specifically because the taste never disappoints." },
    { parentId:p1._id, parentType:'Post', userId:kabir._id,  likeCount:13, content:"Fakruddin portions getting smaller is very true. Used to be full after one plate now I need two." },
    { parentId:p1._id, parentType:'Post', userId:mitu._id,   likeCount:5,  content:"Has anyone tried their Morog Polao? I keep seeing it on the menu but always end up ordering the Kacchi." },
    { parentId:p1._id, parentType:'Post', userId:rakib._id,  likeCount:9,  content:"Saved this post. The ranking is fair. Would add that their Firni is excellent and people sleep on it because they come for the biriyani." },
    { parentId:p1._id, parentType:'Post', userId:priya._id,  likeCount:4,  content:"I am new to the platform and new to exploring Dhaka food seriously. This post is exactly what I needed. Going to try Star Kacchi House this weekend." },
    { parentId:p1._id, parentType:'Post', userId:nadia._id,  likeCount:8,  content:"I am more of an Italian food person but my husband is obsessed with biriyani and he ranks Star Kacchi the same way. Brought me once and I will admit the Kacchi was very good even for someone who does not normally eat it." },
    // Post 2 — Gulshan vs Dhanmondi (rina)
    { parentId:p2._id, parentType:'Post', userId:ahmed._id,  likeCount:12, content:"This is exactly right. The ribeye at Gulshan Grill is incredible but I would never go there on a regular Tuesday. Star Kacchi is my regular Tuesday." },
    { parentId:p2._id, parentType:'Post', userId:jasim._id,  likeCount:13, content:"Both areas win for different reasons. Old Dhaka is the real underrated one though. Puran Dhaka Bhojon gives you an experience that neither Gulshan nor Dhanmondi can replicate." },
    { parentId:p2._id, parentType:'Post', userId:nadia._id,  likeCount:13, content:"For date night Gulshan every time. The ambience at Gulshan Grill is genuinely lovely. My husband proposed to me at a restaurant in Gulshan so I might be biased." },
    { parentId:p2._id, parentType:'Post', userId:sumaiya._id,likeCount:6,  content:"As the owner of Gulshan Grill I appreciate the kind words about ambience and experience. We work hard on both the food quality and the setting. Our ingredients are premium and that is reflected in the price." },
    { parentId:p2._id, parentType:'Post', userId:farhan._id, likeCount:6,  content:"Respectfully, 1800 BDT for a steak is a lot for Dhaka regardless of ingredient quality. Context matters." },
    // Post 3 — Old Dhaka food tour (farhan)
    { parentId:p3._id, parentType:'Post', userId:jasim._id,  likeCount:13, content:"The 7am bakarkhani move is correct. You have to go early before they run out. The afternoon batch is not the same." },
    { parentId:p3._id, parentType:'Post', userId:tariq._id,  likeCount:13, content:"As the owner of Puran Dhaka Bhojon, reading this made me proud. The bakarkhani recipe has not changed in 40 years. My grandfather started it. Thank you for visiting and for writing this." },
    { parentId:p3._id, parentType:'Post', userId:ahmed._id,  likeCount:13, content:"Under 700 BDT for a full day of eating in Old Dhaka is honestly remarkable. You cannot get lunch for that in Gulshan." },
    { parentId:p3._id, parentType:'Post', userId:priya._id,  likeCount:6,  content:"I grew up going to Old Dhaka with my parents but stopped after I moved to Uttara. This post is making me want to go back. Adding it to my list." },
    { parentId:p3._id, parentType:'Post', userId:mitu._id,   likeCount:3,  content:"Is Puran Dhaka Bhojon okay for someone who does not know Old Dhaka well? I am a bit nervous about navigating Chawkbazar alone." },
    { parentId:p3._id, parentType:'Post', userId:rina._id,   likeCount:11, content:"The consistency is the remarkable thing. You can feel that the recipe is not being improvised. It tastes like it has been made the same way for a very long time." },
    // Post 4 — Sakura Japanese (nadia)
    { parentId:p4._id, parentType:'Post', userId:farhan._id, likeCount:11, content:"The sashimi freshness point is the key thing. I tried a different Japanese place in Dhaka last year and the fish was clearly not fresh. If Sakura is getting that right then it is worth the price." },
    { parentId:p4._id, parentType:'Post', userId:rakib._id,  likeCount:13, content:"980 BDT for sashimi is hard to justify when I can get a full Kacchi meal for 380. Different experience I know but the value comparison is always in my head." },
    { parentId:p4._id, parentType:'Post', userId:jasim._id,  likeCount:9,  content:"Went based on this post. The ramen is legitimately good. Broth is rich and the noodles are the right texture. The gyoza was also very good. Will go back." },
    { parentId:p4._id, parentType:'Post', userId:priya._id,  likeCount:4,  content:"I had Japanese food once abroad and loved it. This is the first Dhaka Japanese place I am actually considering trying. The ramen specifically sounds worth it." },
    // Post 5 — Bakarkhani (ahmed)
    { parentId:p5._id, parentType:'Post', userId:tariq._id,  likeCount:13, content:"The bakarkhani is made fresh every morning from 7am. My father used to say the recipe is the soul of the restaurant. Thank you for noticing it. Most people come for the tehari and the bakarkhani is our quiet pride." },
    { parentId:p5._id, parentType:'Post', userId:rina._id,   likeCount:13, content:"This is exactly the kind of post the community needs. Not the obvious picks — the things you almost miss. The bakarkhani is extraordinary and it took me three visits to even notice it." },
    { parentId:p5._id, parentType:'Post', userId:farhan._id, likeCount:8,  content:"20 BDT for something that good is almost suspicious. Going back next week specifically to try this." },
    { parentId:p5._id, parentType:'Post', userId:jasim._id,  likeCount:11, content:"Ordered it on my last visit after seeing this post was being discussed in the community. Confirmed — it is excellent. The texture is unlike any other bread I have had in the city." },
    { parentId:p5._id, parentType:'Post', userId:priya._id,  likeCount:3,  content:"Adding this to my list for when I finally do the Old Dhaka trip. 20 BDT is genuinely nothing." },
    // Post 6 — Healthy Bowl (priya)
    { parentId:p6._id, parentType:'Post', userId:nadia._id,  likeCount:9,  content:"The calorie count thing is genuinely rare and useful. I always feel uncertain about what I am actually eating at restaurants here. Going to try this." },
    { parentId:p6._id, parentType:'Post', userId:mitu._id,   likeCount:6,  content:"I have a booking there tomorrow actually. This post is making me more excited. Going to try the Protein Power Bowl specifically." },
    { parentId:p6._id, parentType:'Post', userId:farhan._id, likeCount:4,  content:"Three times a week at 480 BDT per visit is 5760 BDT a month just for lunch. I respect the commitment but that is not accessible for most people." },
    { parentId:p6._id, parentType:'Post', userId:kabir._id,  likeCount:8,  content:"Uttara is far for me but the hygiene point is the selling factor. So many places in Dhaka make good food in questionable conditions. If this place is genuinely clean that is worth something." },
    // Post 7 — Mezban at 11pm (kabir)
    { parentId:p7._id, parentType:'Post', userId:ahmed._id,  likeCount:13, content:"The late night shawarma market in Dhaka is surprisingly competitive but Mezban is consistently at the top. The fact that it is made fresh and not reheated is the difference." },
    { parentId:p7._id, parentType:'Post', userId:jasim._id,  likeCount:13, content:"The fuchka there is some of the best I have had. The tamarind water they use is perfectly balanced. You cannot get this at a sit-down restaurant." },
    { parentId:p7._id, parentType:'Post', userId:rina._id,   likeCount:13, content:"Standing food in Dhaka gets overlooked because the platform culture tends toward sit-down restaurants. This post is a good reminder that some of the best food in the city has no chairs." },
    { parentId:p7._id, parentType:'Post', userId:farhan._id, likeCount:10, content:"Mirpur 10 at 11pm is fine if you know the area. Worth mentioning for people who are not familiar — go with someone who knows the neighbourhood the first time." },
    { parentId:p7._id, parentType:'Post', userId:rakib._id,  likeCount:4,  content:"Added Mezban to my favorites based on this thread. Going this Friday after work." },
    // Post 8 — Reservation complaint (mitu)
    { parentId:p8._id, parentType:'Post', userId:ahmed._id,  likeCount:12, content:"This happens everywhere. The reservation is treated as a suggestion rather than a commitment. Food Tabs slot system at least blocks the slot so it cannot be double booked." },
    { parentId:p8._id, parentType:'Post', userId:admin._id,  likeCount:13, content:"This is a real issue we take seriously on Food Tabs. Our reservation system holds the slot in real time and the restaurant owner is notified immediately of each booking. If any Food Tabs restaurant fails to honour a confirmed reservation, please report it through the platform and our team will follow up directly." },
    { parentId:p8._id, parentType:'Post', userId:rina._id,   likeCount:13, content:"45 minutes with no apology is unacceptable. Reservation culture in Dhaka needs to improve generally. Restaurants that manage it well deserve the business." },
    { parentId:p8._id, parentType:'Post', userId:kabir._id,  likeCount:13, content:"Had a similar experience. They gave the table to a walk-in while we were waiting. They prioritised the walk-in over the reservation. That is backwards." },
    { parentId:p8._id, parentType:'Post', userId:farhan._id, likeCount:13, content:"The issue is there is no penalty for restaurants that do this. They take the reservation, give away the table, and face no consequence. Review culture is the only accountability mechanism." },
    { parentId:p8._id, parentType:'Post', userId:priya._id,  likeCount:5,  content:"Good to know Food Tabs handles this properly. That was one of the reasons I started using this platform specifically for reservations." },
    // Post 10 — Differential treatment (rakib)
    { parentId:p10._id,parentType:'Post', userId:rina._id,   likeCount:13, content:"Yes. This is a real and common phenomenon in Dhaka upscale dining. The five-category rating system is for exactly this — you can rate the food highly and the service poorly and both are reflected accurately." },
    { parentId:p10._id,parentType:'Post', userId:jasim._id,  likeCount:11, content:"I have noticed this too. The solution is consistent: when service is poor, rate service poorly. Enough low service scores and the restaurant knows it has a problem." },
    { parentId:p10._id,parentType:'Post', userId:farhan._id, likeCount:9,  content:"Write the review. Describe exactly what you noticed. The service criterion exists for a reason. Do not let the food quality prevent you from being honest about the service." },
    { parentId:p10._id,parentType:'Post', userId:mitu._id,   likeCount:7,  content:"I appreciate you sharing this. It is the kind of feedback that matters. Service quality is a real criterion and it should affect the overall score." },
    { parentId:p10._id,parentType:'Post', userId:ahmed._id,  likeCount:6,  content:"This is exactly why dish and criteria-level ratings matter more than a single star score. You can give a restaurant 4 stars for food and 2 stars for service and both are captured." },
    // Post 11 — Birthday dinner ask (priya)
    { parentId:p11._id,parentType:'Post', userId:ahmed._id,  likeCount:11, content:"Bella Napoli fits perfectly. The service is genuinely good, it is not too loud, and the ambience for parents would be impressive without being overwhelming. The carbonara alone will win them over." },
    { parentId:p11._id,parentType:'Post', userId:nadia._id,  likeCount:10, content:"Gulshan Grill and Co is also a great option. The outdoor seating in the evening is spectacular and 5000 BDT for 4 people is achievable if you skip the ribeye. The BBQ chicken half is excellent value." },
    { parentId:p11._id,parentType:'Post', userId:jasim._id,  likeCount:9,  content:"Second the Bella Napoli recommendation. Parents from outside Dhaka are usually impressed by European-style settings. The staff are used to handling special occasions well." },
    { parentId:p11._id,parentType:'Post', userId:kabir._id,  likeCount:6,  content:"Make a reservation regardless of where you go. Walk-in for a birthday dinner at a Gulshan restaurant on a weekend is risky. Book through Food Tabs and you are guaranteed the table." },
    // Post 12 — Omakase question (farhan)
    { parentId:p12._id,parentType:'Post', userId:nadia._id,  likeCount:11, content:"Yes. I attended last month. It is genuinely a special experience — the chef explains each course and the progression of flavours is thoughtful. Not just paying for a label." },
    { parentId:p12._id,parentType:'Post', userId:rakib._id,  likeCount:9,  content:"4500 taka for 9 courses with a chef narrating each one is actually reasonable by any international standard. The question is your reference point." },
    { parentId:p12._id,parentType:'Post', userId:jasim._id,  likeCount:7,  content:"The salmon sashimi in the omakase is noticeably better quality than what you get on the regular menu. The chef selects the best cuts for the omakase guests. That alone justifies the premium for me." },
    // Post 13 — Late night biriyani ask (ahmed)
    { parentId:p13._id,parentType:'Post', userId:jasim._id,  likeCount:8,  content:"There is a small place on Road 4 that operates until 1am. Cannot vouch for quality but they are always busy which is a good sign." },
    { parentId:p13._id,parentType:'Post', userId:kabir._id,  likeCount:7,  content:"Star Kacchi itself sometimes stays open later on weekends unofficially. Worth calling ahead." },
    { parentId:p13._id,parentType:'Post', userId:rina._id,   likeCount:9,  content:"Your best bet honestly is to eat before 11pm. The late night versions of biriyani are usually from the afternoon batch reheated. Quality drops after 10pm at most places." },
    { parentId:p13._id,parentType:'Post', userId:farhan._id, likeCount:5,  content:"Mirpur has more late night options than Dhanmondi for biriyani. The biriyani culture in Mirpur runs later and the quality at the better places holds up past midnight." },
    // Post 14 — How to verify reviews (mitu) — admin explanation
    { parentId:p14._id,parentType:'Post', userId:admin._id,  likeCount:13, content:"Great question. On Food Tabs, reviews written by customers who completed a booking through our platform automatically receive a Verified Visit badge. You can see this badge on the review. It means the reviewer provably visited. Unverified reviews are still genuine in most cases but the badge gives you the highest confidence level." },
    { parentId:p14._id,parentType:'Post', userId:farhan._id, likeCount:11, content:"That verified badge system is actually what made me trust this platform over others. The badge means something real." },
    { parentId:p14._id,parentType:'Post', userId:ahmed._id,  likeCount:10, content:"I got the verified badge on my Star Kacchi review without doing anything — the system just detected my booking automatically. Very smooth." },
    { parentId:p14._id,parentType:'Post', userId:rina._id,   likeCount:8,  content:"The five-criteria rating is also a trust signal. A fake review tends to just give a single star score. A real review typically breaks down the experience across all five criteria." },
    // Post 20 — Mirpur guide (kabir)
    { parentId:p20._id,parentType:'Post', userId:ahmed._id,  likeCount:8,  content:"As someone from Mirpur I appreciate this. The fuchka culture here is specifically different from Dhanmondi and worth its own guide." },
    { parentId:p20._id,parentType:'Post', userId:jasim._id,  likeCount:9,  content:"Mezban Street Kitchen should be on everyone's Mirpur list. The chicken shawarma at 120 taka is the best value in the area." },
    { parentId:p20._id,parentType:'Post', userId:priya._id,  likeCount:5,  content:"This is exactly the kind of hyperlocal knowledge that food apps usually miss. Thank you for this." },
    { parentId:p20._id,parentType:'Post', userId:rina._id,   likeCount:7,  content:"The halim you mentioned on Section 2 — is it the one near the main road or inside the market? Want to make sure I find the right one." },
    { parentId:p20._id,parentType:'Post', userId:nadia._id,  likeCount:6,  content:"Coming from Gulshan, Mirpur feels far but reading this makes me think the trip is justified. Planning a Saturday food trip based on this guide." },
  ];

  const createdComments = await Comment.insertMany(commentData);

  // Nested replies
  const post1FarhanComment = createdComments.find(c => c.parentId.toString() === p1._id.toString() && c.userId.toString() === farhan._id.toString());
  const post1MituComment   = createdComments.find(c => c.parentId.toString() === p1._id.toString() && c.userId.toString() === mitu._id.toString());
  const post3TariqComment  = createdComments.find(c => c.parentId.toString() === p3._id.toString() && c.userId.toString() === tariq._id.toString());
  const post3MituComment   = createdComments.find(c => c.parentId.toString() === p3._id.toString() && c.userId.toString() === mitu._id.toString());
  const post6FarhanComment = createdComments.find(c => c.parentId.toString() === p6._id.toString() && c.userId.toString() === farhan._id.toString());
  const adminVerifyComment = createdComments.find(c => c.parentId.toString() === p14._id.toString() && c.userId.toString() === admin._id.toString());

  const nestedReplies = [];
  if (post1FarhanComment) nestedReplies.push({
    parentId:p1._id, parentType:'Post', parentCommentId:post1FarhanComment._id,
    userId:rina._id, likeCount:5, content:"Fair enough. I will give them another try for the meat quality. The hygiene is just something I cannot ignore though."
  });
  if (post1MituComment) nestedReplies.push({
    parentId:p1._id, parentType:'Post', parentCommentId:post1MituComment._id,
    userId:ahmed._id, likeCount:7, content:"The Morog Polao is good but not as good as the Kacchi. If you are going for the first time, do the Kacchi. After you have had it a few times, try the Morog Polao as a comparison."
  });
  if (post3TariqComment) nestedReplies.push({
    parentId:p3._id, parentType:'Post', parentCommentId:post3TariqComment._id,
    userId:farhan._id, likeCount:13, content:"The consistency is the remarkable thing. You can feel that the recipe is not being improvised. It tastes like it has been made the same way for a very long time. That is rare."
  });
  if (post3MituComment) nestedReplies.push({
    parentId:p3._id, parentType:'Post', parentCommentId:post3MituComment._id,
    userId:farhan._id, likeCount:8, content:"Completely fine. It is on a main road and easy to find. The restaurant itself feels straightforward to walk into even if you are not familiar with the area. Go on a weekday morning when it is less crowded."
  });
  if (post6FarhanComment) nestedReplies.push({
    parentId:p6._id, parentType:'Post', parentCommentId:post6FarhanComment._id,
    userId:priya._id, likeCount:5, content:"Fair point. I cut other spending to make it work. Not saying it is cheap but the health impact for me personally has been worth it."
  });
  if (adminVerifyComment) nestedReplies.push({
    parentId:p14._id, parentType:'Post', parentCommentId:adminVerifyComment._id,
    userId:priya._id, likeCount:7, content:"Thank you for explaining this! I had the verified badge question specifically because I am new to the platform. This makes me much more confident using the reviews to decide where to book."
  });
  const createdNestedReplies = nestedReplies.length ? await Comment.insertMany(nestedReplies) : [];

  // Update commentsCount on posts
  for (const post of [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12,p13,p14,p15,p16,p17,p18,p19,p20]) {
    const count = await Comment.countDocuments({ parentId: post._id, parentType: 'Post' });
    await Post.findByIdAndUpdate(post._id, { commentsCount: count });
  }
  console.log('Comments created');

  // ── Votes ─────────────────────────────────────────────────────────────────
  // Helper: returns up to n users excluding the given author (by _id)
  const allUsers = [ahmed,rina,farhan,jasim,kabir,mitu,rakib,nadia,priya,sonia,sumaiya,tariq,rahim,admin];
  const without = (author, n) => allUsers.filter(u => u._id.toString() !== author._id.toString()).slice(0, n);

  const voteData = [
    // ── Post votes (value:1) ──────────────────────────────────────────────
    ...without(jasim,  12).map(u => ({ userId:u._id, parentId:p1._id,  parentType:'Post', value:1 })),
    ...without(rina,   10).map(u => ({ userId:u._id, parentId:p2._id,  parentType:'Post', value:1 })),
    ...without(farhan, 13).map(u => ({ userId:u._id, parentId:p3._id,  parentType:'Post', value:1 })),
    ...without(nadia,   8).map(u => ({ userId:u._id, parentId:p4._id,  parentType:'Post', value:1 })),
    ...without(ahmed,  11).map(u => ({ userId:u._id, parentId:p5._id,  parentType:'Post', value:1 })),
    ...without(priya,   8).map(u => ({ userId:u._id, parentId:p6._id,  parentType:'Post', value:1 })),
    ...without(kabir,  10).map(u => ({ userId:u._id, parentId:p7._id,  parentType:'Post', value:1 })),
    ...without(mitu,    9).map(u => ({ userId:u._id, parentId:p8._id,  parentType:'Post', value:1 })),
    // p9: isPublished:false — no votes
    ...without(rakib,   7).map(u => ({ userId:u._id, parentId:p10._id, parentType:'Post', value:1 })),
    ...without(priya,   8).map(u => ({ userId:u._id, parentId:p11._id, parentType:'Post', value:1 })),
    ...without(farhan,  8).map(u => ({ userId:u._id, parentId:p12._id, parentType:'Post', value:1 })),
    ...without(ahmed,   9).map(u => ({ userId:u._id, parentId:p13._id, parentType:'Post', value:1 })),
    ...without(mitu,   10).map(u => ({ userId:u._id, parentId:p14._id, parentType:'Post', value:1 })),
    ...without(kabir,   6).map(u => ({ userId:u._id, parentId:p15._id, parentType:'Post', value:1 })),
    ...without(rina,    9).map(u => ({ userId:u._id, parentId:p16._id, parentType:'Post', value:1 })),
    ...without(jasim,   7).map(u => ({ userId:u._id, parentId:p17._id, parentType:'Post', value:1 })),
    ...without(jasim,  10).map(u => ({ userId:u._id, parentId:p18._id, parentType:'Post', value:1 })),
    ...without(nadia,   9).map(u => ({ userId:u._id, parentId:p19._id, parentType:'Post', value:1 })),
    ...without(kabir,  10).map(u => ({ userId:u._id, parentId:p20._id, parentType:'Post', value:1 })),

    // ── Comment votes ──────────────────────────────────────────────────────
    // p1: [0]ahmed(11) [1]farhan(-2) [2]rina(10) [3]kabir(13) [4]mitu(5) [5]rakib(9) [6]priya(4) [7]nadia(8)
    ...without(ahmed,  11).map(u => ({ userId:u._id, parentId:createdComments[0]._id,  parentType:'Comment', value:1  })),
    ...[ahmed,kabir]       .map(u => ({ userId:u._id, parentId:createdComments[1]._id,  parentType:'Comment', value:-1 })),
    ...without(rina,   10).map(u => ({ userId:u._id, parentId:createdComments[2]._id,  parentType:'Comment', value:1  })),
    ...without(kabir,  13).map(u => ({ userId:u._id, parentId:createdComments[3]._id,  parentType:'Comment', value:1  })),
    ...without(mitu,    5).map(u => ({ userId:u._id, parentId:createdComments[4]._id,  parentType:'Comment', value:1  })),
    ...without(rakib,   9).map(u => ({ userId:u._id, parentId:createdComments[5]._id,  parentType:'Comment', value:1  })),
    ...without(priya,   4).map(u => ({ userId:u._id, parentId:createdComments[6]._id,  parentType:'Comment', value:1  })),
    ...without(nadia,   8).map(u => ({ userId:u._id, parentId:createdComments[7]._id,  parentType:'Comment', value:1  })),
    // p2: [8]ahmed(12) [9]jasim(13) [10]nadia(13) [11]sumaiya(6) [12]farhan(6)
    ...without(ahmed,  12).map(u => ({ userId:u._id, parentId:createdComments[8]._id,  parentType:'Comment', value:1 })),
    ...without(jasim,  13).map(u => ({ userId:u._id, parentId:createdComments[9]._id,  parentType:'Comment', value:1 })),
    ...without(nadia,  13).map(u => ({ userId:u._id, parentId:createdComments[10]._id, parentType:'Comment', value:1 })),
    ...without(sumaiya, 6).map(u => ({ userId:u._id, parentId:createdComments[11]._id, parentType:'Comment', value:1 })),
    ...without(farhan,  6).map(u => ({ userId:u._id, parentId:createdComments[12]._id, parentType:'Comment', value:1 })),
    // p3: [13]jasim(13) [14]tariq(13) [15]ahmed(13) [16]priya(6) [17]mitu(3) [18]rina(11)
    ...without(jasim,  13).map(u => ({ userId:u._id, parentId:createdComments[13]._id, parentType:'Comment', value:1 })),
    ...without(tariq,  13).map(u => ({ userId:u._id, parentId:createdComments[14]._id, parentType:'Comment', value:1 })),
    ...without(ahmed,  13).map(u => ({ userId:u._id, parentId:createdComments[15]._id, parentType:'Comment', value:1 })),
    ...without(priya,   6).map(u => ({ userId:u._id, parentId:createdComments[16]._id, parentType:'Comment', value:1 })),
    ...without(mitu,    3).map(u => ({ userId:u._id, parentId:createdComments[17]._id, parentType:'Comment', value:1 })),
    ...without(rina,   11).map(u => ({ userId:u._id, parentId:createdComments[18]._id, parentType:'Comment', value:1 })),
    // p4: [19]farhan(11) [20]rakib(13) [21]jasim(9) [22]priya(4)
    ...without(farhan, 11).map(u => ({ userId:u._id, parentId:createdComments[19]._id, parentType:'Comment', value:1 })),
    ...without(rakib,  13).map(u => ({ userId:u._id, parentId:createdComments[20]._id, parentType:'Comment', value:1 })),
    ...without(jasim,   9).map(u => ({ userId:u._id, parentId:createdComments[21]._id, parentType:'Comment', value:1 })),
    ...without(priya,   4).map(u => ({ userId:u._id, parentId:createdComments[22]._id, parentType:'Comment', value:1 })),
    // p5: [23]tariq(13) [24]rina(13) [25]farhan(8) [26]jasim(11) [27]priya(3)
    ...without(tariq,  13).map(u => ({ userId:u._id, parentId:createdComments[23]._id, parentType:'Comment', value:1 })),
    ...without(rina,   13).map(u => ({ userId:u._id, parentId:createdComments[24]._id, parentType:'Comment', value:1 })),
    ...without(farhan,  8).map(u => ({ userId:u._id, parentId:createdComments[25]._id, parentType:'Comment', value:1 })),
    ...without(jasim,  11).map(u => ({ userId:u._id, parentId:createdComments[26]._id, parentType:'Comment', value:1 })),
    ...without(priya,   3).map(u => ({ userId:u._id, parentId:createdComments[27]._id, parentType:'Comment', value:1 })),
    // p6: [28]nadia(9) [29]mitu(6) [30]farhan(4) [31]kabir(8)
    ...without(nadia,   9).map(u => ({ userId:u._id, parentId:createdComments[28]._id, parentType:'Comment', value:1 })),
    ...without(mitu,    6).map(u => ({ userId:u._id, parentId:createdComments[29]._id, parentType:'Comment', value:1 })),
    ...without(farhan,  4).map(u => ({ userId:u._id, parentId:createdComments[30]._id, parentType:'Comment', value:1 })),
    ...without(kabir,   8).map(u => ({ userId:u._id, parentId:createdComments[31]._id, parentType:'Comment', value:1 })),
    // p7: [32]ahmed(13) [33]jasim(13) [34]rina(13) [35]farhan(10) [36]rakib(4)
    ...without(ahmed,  13).map(u => ({ userId:u._id, parentId:createdComments[32]._id, parentType:'Comment', value:1 })),
    ...without(jasim,  13).map(u => ({ userId:u._id, parentId:createdComments[33]._id, parentType:'Comment', value:1 })),
    ...without(rina,   13).map(u => ({ userId:u._id, parentId:createdComments[34]._id, parentType:'Comment', value:1 })),
    ...without(farhan, 10).map(u => ({ userId:u._id, parentId:createdComments[35]._id, parentType:'Comment', value:1 })),
    ...without(rakib,   4).map(u => ({ userId:u._id, parentId:createdComments[36]._id, parentType:'Comment', value:1 })),
    // p8: [37]ahmed(12) [38]admin(13) [39]rina(13) [40]kabir(13) [41]farhan(13) [42]priya(5)
    ...without(ahmed,  12).map(u => ({ userId:u._id, parentId:createdComments[37]._id, parentType:'Comment', value:1 })),
    ...without(admin,  13).map(u => ({ userId:u._id, parentId:createdComments[38]._id, parentType:'Comment', value:1 })),
    ...without(rina,   13).map(u => ({ userId:u._id, parentId:createdComments[39]._id, parentType:'Comment', value:1 })),
    ...without(kabir,  13).map(u => ({ userId:u._id, parentId:createdComments[40]._id, parentType:'Comment', value:1 })),
    ...without(farhan, 13).map(u => ({ userId:u._id, parentId:createdComments[41]._id, parentType:'Comment', value:1 })),
    ...without(priya,   5).map(u => ({ userId:u._id, parentId:createdComments[42]._id, parentType:'Comment', value:1 })),
    // p10: [43]rina(13) [44]jasim(11) [45]farhan(9) [46]mitu(7) [47]ahmed(6)
    ...without(rina,   13).map(u => ({ userId:u._id, parentId:createdComments[43]._id, parentType:'Comment', value:1 })),
    ...without(jasim,  11).map(u => ({ userId:u._id, parentId:createdComments[44]._id, parentType:'Comment', value:1 })),
    ...without(farhan,  9).map(u => ({ userId:u._id, parentId:createdComments[45]._id, parentType:'Comment', value:1 })),
    ...without(mitu,    7).map(u => ({ userId:u._id, parentId:createdComments[46]._id, parentType:'Comment', value:1 })),
    ...without(ahmed,   6).map(u => ({ userId:u._id, parentId:createdComments[47]._id, parentType:'Comment', value:1 })),
    // p11: [48]ahmed(11) [49]nadia(10) [50]jasim(9) [51]kabir(6)
    ...without(ahmed,  11).map(u => ({ userId:u._id, parentId:createdComments[48]._id, parentType:'Comment', value:1 })),
    ...without(nadia,  10).map(u => ({ userId:u._id, parentId:createdComments[49]._id, parentType:'Comment', value:1 })),
    ...without(jasim,   9).map(u => ({ userId:u._id, parentId:createdComments[50]._id, parentType:'Comment', value:1 })),
    ...without(kabir,   6).map(u => ({ userId:u._id, parentId:createdComments[51]._id, parentType:'Comment', value:1 })),
    // p12: [52]nadia(11) [53]rakib(9) [54]jasim(7)
    ...without(nadia,  11).map(u => ({ userId:u._id, parentId:createdComments[52]._id, parentType:'Comment', value:1 })),
    ...without(rakib,   9).map(u => ({ userId:u._id, parentId:createdComments[53]._id, parentType:'Comment', value:1 })),
    ...without(jasim,   7).map(u => ({ userId:u._id, parentId:createdComments[54]._id, parentType:'Comment', value:1 })),
    // p13: [55]jasim(8) [56]kabir(7) [57]rina(9) [58]farhan(5)
    ...without(jasim,   8).map(u => ({ userId:u._id, parentId:createdComments[55]._id, parentType:'Comment', value:1 })),
    ...without(kabir,   7).map(u => ({ userId:u._id, parentId:createdComments[56]._id, parentType:'Comment', value:1 })),
    ...without(rina,    9).map(u => ({ userId:u._id, parentId:createdComments[57]._id, parentType:'Comment', value:1 })),
    ...without(farhan,  5).map(u => ({ userId:u._id, parentId:createdComments[58]._id, parentType:'Comment', value:1 })),
    // p14: [59]admin(13) [60]farhan(11) [61]ahmed(10) [62]rina(8)
    ...without(admin,  13).map(u => ({ userId:u._id, parentId:createdComments[59]._id, parentType:'Comment', value:1 })),
    ...without(farhan, 11).map(u => ({ userId:u._id, parentId:createdComments[60]._id, parentType:'Comment', value:1 })),
    ...without(ahmed,  10).map(u => ({ userId:u._id, parentId:createdComments[61]._id, parentType:'Comment', value:1 })),
    ...without(rina,    8).map(u => ({ userId:u._id, parentId:createdComments[62]._id, parentType:'Comment', value:1 })),
    // p20: [63]ahmed(8) [64]jasim(9) [65]priya(5) [66]rina(7) [67]nadia(6)
    ...without(ahmed,   8).map(u => ({ userId:u._id, parentId:createdComments[63]._id, parentType:'Comment', value:1 })),
    ...without(jasim,   9).map(u => ({ userId:u._id, parentId:createdComments[64]._id, parentType:'Comment', value:1 })),
    ...without(priya,   5).map(u => ({ userId:u._id, parentId:createdComments[65]._id, parentType:'Comment', value:1 })),
    ...without(rina,    7).map(u => ({ userId:u._id, parentId:createdComments[66]._id, parentType:'Comment', value:1 })),
    ...without(nadia,   6).map(u => ({ userId:u._id, parentId:createdComments[67]._id, parentType:'Comment', value:1 })),

    // ── Nested reply votes ────────────────────────────────────────────────
    // nr[0] rina→p1 (likeCount:5), nr[1] ahmed→p1 (7), nr[2] farhan→p3 (13),
    // nr[3] farhan→p3 (8),         nr[4] priya→p6 (5), nr[5] priya→p14 (7)
    ...(createdNestedReplies[0] ? without(rina,   5).map(u => ({ userId:u._id, parentId:createdNestedReplies[0]._id, parentType:'Comment', value:1 })) : []),
    ...(createdNestedReplies[1] ? without(ahmed,  7).map(u => ({ userId:u._id, parentId:createdNestedReplies[1]._id, parentType:'Comment', value:1 })) : []),
    ...(createdNestedReplies[2] ? without(farhan,13).map(u => ({ userId:u._id, parentId:createdNestedReplies[2]._id, parentType:'Comment', value:1 })) : []),
    ...(createdNestedReplies[3] ? without(farhan, 8).map(u => ({ userId:u._id, parentId:createdNestedReplies[3]._id, parentType:'Comment', value:1 })) : []),
    ...(createdNestedReplies[4] ? without(priya,  5).map(u => ({ userId:u._id, parentId:createdNestedReplies[4]._id, parentType:'Comment', value:1 })) : []),
    ...(createdNestedReplies[5] ? without(priya,  7).map(u => ({ userId:u._id, parentId:createdNestedReplies[5]._id, parentType:'Comment', value:1 })) : []),

    // ── Review votes ──────────────────────────────────────────────────────
    ...[ahmed,jasim,mitu].map(u => ({ userId:u._id, parentId:reviews[0]._id,  parentType:'Review', value:1 })),
    ...[rina,nadia,kabir].map(u => ({ userId:u._id, parentId:reviews[16]._id, parentType:'Review', value:1 })),
  ];
  // Remove potential duplicates by userId+parentId combination
  const seen = new Set();
  const uniqueVotes = voteData.filter(v => {
    const key = `${v.userId}-${v.parentId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  await Vote.insertMany(uniqueVotes);
  console.log('Votes created');

  // ── Reports ───────────────────────────────────────────────────────────────
  const soniaMezbanReview = reviews.find(rv => rv.userId.toString() === sonia._id.toString() && rv.restaurantId.toString() === r6._id.toString());
  const soniaPost = p9;

  await Report.insertMany([
    { reporterId:farhan._id, reviewId:soniaMezbanReview._id, type:'review', reason:'inappropriate', status:'pending', description:'Review makes potentially misleading health claims without evidence.' },
    { reporterId:mitu._id, postId:soniaPost._id, type:'post', reason:'health-claim', status:'pending', description:'Post makes a health-safety allegation that requires verification.' },
    { reporterId:admin._id, commentId:createdComments[3]._id, type:'comment', reason:'spam', status:'resolved', adminNotes:'Warning issued to user.', action:'warn', actionTakenBy:admin._id },
    { reporterId:sumaiya._id, reviewId:reviews.find(rv=>rv.restaurantId.toString()===r2._id.toString()&&rv.userId.toString()===farhan._id.toString())._id, type:'review', reason:'fake-review', status:'pending', description:'Suspect this is a competitor review — rating inconsistent with the review content.' },
    { reporterId:admin._id, reviewId:reviews[0]._id, type:'review', reason:'spam', status:'resolved', adminNotes:'Review was genuine. No action taken.', action:'none', actionTakenBy:admin._id },
  ]);
  console.log('Reports created');

  // ── Events ────────────────────────────────────────────────────────────────
  const [evKacchi, evGulshan, evSakura] = await Event.insertMany([
    {
      restaurantId: r1._id,
      name: 'Eid Special Dawat',
      description: 'A special Eid celebration menu featuring our legendary Kacchi, Rezala, Borhani, and a three-dessert finale. Traditional setting, festive atmosphere.',
      eventDate: daysFromNow(10), eventTime: '19:00',
      price: 1500, capacity: 30, seatsBooked: 22, isActive: true
    },
    {
      restaurantId: r2._id,
      name: 'Friday Night BBQ',
      description: 'Live charcoal grilling, unlimited sides, a DJ set, and the best meats in Dhaka. Adults only.',
      eventDate: nextWeekday(5), eventTime: '20:00',
      price: 2500, capacity: 40, seatsBooked: 38, isActive: true
    },
    {
      restaurantId: r4._id,
      name: 'Omakase Evening',
      description: 'A 9-course omakase experience curated by our head chef. Seasonal ingredients, sake pairing available. Maximum 12 guests.',
      eventDate: daysFromNow(21), eventTime: '19:30',
      price: 4500, capacity: 12, seatsBooked: 4, isActive: true
    }
  ]);
  console.log('Events created');

  // Event bookings (seats purchased)
  await EventBooking.insertMany([
    { userId:rina._id,  restaurantId:r1._id, eventName:'Eid Special Dawat', eventType:'Special Event',
      eventDate:evKacchi.eventDate, eventTime:'19:00', duration:180, guestCount:1,
      estimatedBudget:1500, status:'confirmed', confirmationCode:'EV-RINA-EID-001' },
    { userId:kabir._id, restaurantId:r2._id, eventName:'Friday Night BBQ',  eventType:'Special Event',
      eventDate:evGulshan.eventDate, eventTime:'20:00', duration:240, guestCount:1,
      estimatedBudget:2500, status:'confirmed', confirmationCode:'EV-KABIR-BBQ-001' },
  ]);

  // ── Favorites ─────────────────────────────────────────────────────────────
  await Favorite.insertMany([
    { userId:rakib._id, restaurantId:r1._id, type:'restaurant' },
    { userId:rakib._id, restaurantId:r4._id, type:'restaurant' },
    { userId:ahmed._id, restaurantId:r2._id, type:'restaurant' },
    { userId:ahmed._id, restaurantId:r6._id, type:'restaurant' },
    { userId:nadia._id, restaurantId:r5._id, type:'restaurant' },
    { userId:nadia._id, restaurantId:r7._id, type:'restaurant' },
  ]);

  // ── Saved Orders ──────────────────────────────────────────────────────────
  const kacchiBeef  = d('Kacchi Biriyani (Beef)');
  const borhaniR1   = d('Borhani');
  const firni       = d('Firni');
  const ribeyeSteak = d('Ribeye Steak 300g');
  const lavaChoc    = d('Chocolate Lava Cake');

  await SavedOrder.insertMany([
    {
      userId: rakib._id, restaurantId: r1._id,
      name: 'My Usual Friday Night',
      items: [
        { dishId: kacchiBeef._id, quantity: 1, price: kacchiBeef.price },
        { dishId: borhaniR1._id, quantity: 1, price: borhaniR1.price },
        { dishId: firni._id,     quantity: 1, price: firni.price }
      ],
      totalPrice: kacchiBeef.price + borhaniR1.price + firni.price
    },
    {
      userId: ahmed._id, restaurantId: r2._id,
      name: 'Date Night',
      items: [
        { dishId: ribeyeSteak._id, quantity: 1, price: ribeyeSteak.price },
        { dishId: lavaChoc._id,    quantity: 2, price: lavaChoc.price }
      ],
      totalPrice: ribeyeSteak.price + (lavaChoc.price * 2)
    }
  ]);
  console.log('Favorites and saved orders created');

  console.log('Favorites and saved orders created');

  // ── Print summary ─────────────────────────────────────────────────────────
  console.log(`
========================================
FOOD TABS — SEED S3 COMPLETE
Sprint 3: Discovery — Recommendations, Favorites, Saved Orders, Event Booking
========================================

TEST ACCOUNTS:

ADMIN   admin@foodtabs.com    Admin@1234
OWNERS  [owner]@foodtabs.com  Owner@1234
CUSTOMERS [name]@foodtabs.com Customer@1234

WHAT YOU CAN TEST:
  Events            — Eid Special Dawat (Star Kacchi), Friday Night BBQ (Gulshan), Omakase Evening (Sakura)
  Event booking     — try booking the Friday Night BBQ (only 2 seats left)
  Favorites         — log in as rakib or ahmed, check saved restaurants
  Saved orders      — log in as rakib (My Usual Friday Night) or ahmed (Date Night)
  Forum + community — all Sprint 2 features still active
========================================
`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
