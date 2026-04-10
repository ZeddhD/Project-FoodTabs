import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Import models
import Restaurant from './models/Restaurant.js';
import Dish from './models/Dish.js';
import User from './models/User.js';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB connected for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Dish.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create a test owner user
    const testOwner = await User.create({
      name: 'Restaurant Owner',
      email: 'owner@example.com',
      password: 'Password123', // Will be hashed by pre-save hook
      phone: '+1-555-0100',
      role: 'owner',
    });
    console.log(`✓ Created test owner: ${testOwner._id}`);

    // Sample Restaurants with ownerId
    const restaurants = await Restaurant.insertMany([
      {
        name: 'Sushi House',
        description: 'Authentic Japanese sushi and ramen restaurant',
        ownerId: testOwner._id,
        cuisineTypes: ['Japanese', 'Sushi'],
        address: '123 Sushi Lane, Downtown',
        city: 'Downtown',
        phone: '+1-555-0101',
        email: 'sushi@example.com',
        coverImage: 'https://via.placeholder.com/800?text=Sushi+House',
        openingHours: {
          monday: { open: '11:00', close: '23:00' },
          tuesday: { open: '11:00', close: '23:00' },
          wednesday: { open: '11:00', close: '23:00' },
          thursday: { open: '11:00', close: '23:00' },
          friday: { open: '11:00', close: '00:00' },
          saturday: { open: '10:00', close: '00:00' },
          sunday: { open: '10:00', close: '23:00' },
        },
        rating: 4.8,
        reviewsCount: 8,
        isVerified: true,
        tags: ['Japanese', 'Sushi', 'Fine Dining'],
      },
      {
        name: 'Pizza Paradise',
        description: 'Italian pizzeria with traditional wood-fired ovens',
        ownerId: testOwner._id,
        cuisineTypes: ['Italian', 'Pizza'],
        address: '456 Pizza Street, North End',
        city: 'North End',
        phone: '+1-555-0102',
        email: 'pizza@example.com',
        coverImage: 'https://via.placeholder.com/800?text=Pizza+Paradise',
        openingHours: {
          monday: { open: '12:00', close: '22:00' },
          tuesday: { open: '12:00', close: '22:00' },
          wednesday: { open: '12:00', close: '22:00' },
          thursday: { open: '12:00', close: '22:00' },
          friday: { open: '12:00', close: '23:00' },
          saturday: { open: '11:00', close: '23:00' },
          sunday: { open: '11:00', close: '22:00' },
        },
        rating: 4.5,
        reviewsCount: 12,
        isVerified: true,
        tags: ['Italian', 'Pizza', 'Casual'],
      },
      {
        name: 'Burger Barn',
        description: 'Classic American burgers and fast food',
        ownerId: testOwner._id,
        cuisineTypes: ['American', 'Burgers'],
        address: '789 Burger Road, West Side',
        city: 'West Side',
        phone: '+1-555-0103',
        email: 'burger@example.com',
        coverImage: 'https://via.placeholder.com/800?text=Burger+Barn',
        openingHours: {
          monday: { open: '10:00', close: '23:00' },
          tuesday: { open: '10:00', close: '23:00' },
          wednesday: { open: '10:00', close: '23:00' },
          thursday: { open: '10:00', close: '23:00' },
          friday: { open: '10:00', close: '00:00' },
          saturday: { open: '9:00', close: '00:00' },
          sunday: { open: '9:00', close: '23:00' },
        },
        rating: 4.2,
        reviewsCount: 15,
        isVerified: false,
        tags: ['American', 'Burgers', 'Fast Food'],
      },
      {
        name: 'Thai Express',
        description: 'Authentic Thai cuisine with spicy curries and noodles',
        ownerId: testOwner._id,
        cuisineTypes: ['Thai', 'Asian'],
        address: '321 Thai Avenue, Chinatown',
        city: 'Chinatown',
        phone: '+1-555-0104',
        email: 'thai@example.com',
        coverImage: 'https://via.placeholder.com/800?text=Thai+Express',
        openingHours: {
          monday: { open: '11:00', close: '22:00' },
          tuesday: { open: '11:00', close: '22:00' },
          wednesday: { open: '11:00', close: '22:00' },
          thursday: { open: '11:00', close: '22:00' },
          friday: { open: '11:00', close: '23:00' },
          saturday: { open: '12:00', close: '23:00' },
          sunday: { open: '12:00', close: '22:00' },
        },
        rating: 4.7,
        reviewsCount: 10,
        isVerified: true,
        tags: ['Thai', 'Asian', 'Spicy'],
      },
      {
        name: 'Pasta Perfetto',
        description: 'Homemade Italian pasta and traditional recipes',
        ownerId: testOwner._id,
        cuisineTypes: ['Italian', 'Pasta'],
        address: '654 Pasta Plaza, Little Italy',
        city: 'Little Italy',
        phone: '+1-555-0105',
        email: 'pasta@example.com',
        coverImage: 'https://via.placeholder.com/800?text=Pasta+Perfetto',
        openingHours: {
          monday: { open: '17:00', close: '23:00' },
          tuesday: { open: '17:00', close: '23:00' },
          wednesday: { open: '17:00', close: '23:00' },
          thursday: { open: '17:00', close: '23:00' },
          friday: { open: '17:00', close: '00:00' },
          saturday: { open: '16:00', close: '00:00' },
          sunday: { open: '16:00', close: '23:00' },
        },
        rating: 4.9,
        reviewsCount: 20,
        isVerified: true,
        tags: ['Italian', 'Pasta', 'Fine Dining'],
      },
      {
        name: 'Dragon Wok',
        description: 'Chinese restaurant with wok-cooked dishes and dim sum',
        ownerId: testOwner._id,
        cuisineTypes: ['Chinese', 'Asian'],
        address: '987 Wok Street, Chinatown',
        city: 'Chinatown',
        phone: '+1-555-0106',
        email: 'dragon@example.com',
        coverImage: 'https://via.placeholder.com/800?text=Dragon+Wok',
        openingHours: {
          monday: { open: '11:00', close: '22:00' },
          tuesday: { open: '11:00', close: '22:00' },
          wednesday: { open: '11:00', close: '22:00' },
          thursday: { open: '11:00', close: '22:00' },
          friday: { open: '11:00', close: '23:00' },
          saturday: { open: '10:00', close: '23:00' },
          sunday: { open: '10:00', close: '22:00' },
        },
        rating: 4.4,
        reviewsCount: 9,
        isVerified: true,
        tags: ['Chinese', 'Asian', 'Dim Sum'],
      },
    ]);

    console.log(`✓ Created ${restaurants.length} restaurants`);

    // Sample Dishes for each restaurant
    const dishes = [
      // Sushi House dishes
      {
        restaurantId: restaurants[0]._id,
        name: 'California Roll',
        description: 'Fresh crab, avocado, and cucumber',
        price: 12.99,
        category: 'Sushi',
        images: ['https://via.placeholder.com/300?text=California+Roll'],
        rating: 4.7,
        isAvailable: true,
      },
      {
        restaurantId: restaurants[0]._id,
        name: 'Tuna Sashimi',
        description: 'Fresh tuna slices with soy sauce and wasabi',
        price: 18.99,
        category: 'Sashimi',
        images: ['https://via.placeholder.com/300?text=Tuna+Sashimi'],
        rating: 4.9,
        isAvailable: true,
      },
      {
        restaurantId: restaurants[0]._id,
        name: 'Miso Soup',
        description: 'Traditional Japanese soup with tofu and seaweed',
        price: 3.99,
        category: 'Soup',
        images: ['https://via.placeholder.com/300?text=Miso+Soup'],
        rating: 4.5,
        isAvailable: true,
      },

      // Pizza Paradise dishes
      {
        restaurantId: restaurants[1]._id,
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomato, and basil',
        price: 12.99,
        category: 'Pizza',
        images: ['https://via.placeholder.com/300?text=Margherita+Pizza'],
        rating: 4.6,
        isAvailable: true,
      },
      {
        restaurantId: restaurants[1]._id,
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni with mozzarella cheese',
        price: 14.99,
        category: 'Pizza',
        images: ['https://via.placeholder.com/300?text=Pepperoni+Pizza'],
        rating: 4.8,
        isAvailable: true,
      },
      {
        restaurantId: restaurants[1]._id,
        name: 'Vegetarian Special',
        description: 'Mixed vegetables with olive oil and herbs',
        price: 11.99,
        category: 'Pizza',
        images: ['https://via.placeholder.com/300?text=Vegetarian+Pizza'],
        rating: 4.4,
        isAvailable: true,
      },

      // Burger Barn dishes
      {
        restaurantId: restaurants[2]._id,
        name: 'Classic Cheeseburger',
        description: 'Beef patty with cheddar cheese, lettuce, and tomato',
        price: 9.99,
        category: 'Burgers',
        images: ['https://via.placeholder.com/300?text=Classic+Cheeseburger'],
        rating: 4.5,
        isAvailable: true,
      },
      {
        restaurantId: restaurants[2]._id,
        name: 'Bacon Burger',
        description: 'Beef patty with crispy bacon and swiss cheese',
        price: 11.99,
        category: 'Burgers',
        images: ['https://via.placeholder.com/300?text=Bacon+Burger'],
        rating: 4.7,
        isAvailable: true,
      },
      {
        restaurantId: restaurants[2]._id,
        name: 'French Fries',
        description: 'Crispy golden fries with sea salt',
        price: 4.99,
        category: 'Sides',
        images: ['https://via.placeholder.com/300?text=French+Fries'],
        rating: 4.3,
        isAvailable: true,
      },

      // Thai Express dishes
      {
        restaurantId: restaurants[3]._id,
        name: 'Green Curry',
        description: 'Spicy green curry with coconut milk and basil',
        price: 13.99,
        category: 'Curry',
        images: ['https://via.placeholder.com/300?text=Green+Curry'],
        rating: 4.8,
        isAvailable: true,
      },
      {
        restaurantId: restaurants[3]._id,
        name: 'Pad Thai',
        description: 'Rice noodles with shrimp, egg, and peanuts',
        price: 11.99,
        category: 'Noodles',
        images: ['https://via.placeholder.com/300?text=Pad+Thai'],
        rating: 4.9,
        isAvailable: true,
      },

      // Pasta Perfetto dishes
      {
        restaurantId: restaurants[4]._id,
        name: 'Spaghetti Carbonara',
        description: 'Spaghetti with bacon, egg, and parmesan sauce',
        price: 14.99,
        category: 'Pasta',
        images: ['https://via.placeholder.com/300?text=Spaghetti+Carbonara'],
        rating: 4.9,
        isAvailable: true,
      },
      {
        restaurantId: restaurants[4]._id,
        name: 'Fettuccine Alfredo',
        description: 'Creamy alfredo sauce with fettuccine pasta',
        price: 12.99,
        category: 'Pasta',
        images: ['https://via.placeholder.com/300?text=Fettuccine+Alfredo'],
        rating: 4.7,
        isAvailable: true,
      },

      // Dragon Wok dishes
      {
        restaurantId: restaurants[5]._id,
        name: 'Kung Pao Chicken',
        description: 'Diced chicken with peanuts and chili peppers',
        price: 11.99,
        category: 'Stir Fry',
        images: ['https://via.placeholder.com/300?text=Kung+Pao+Chicken'],
        rating: 4.6,
        isAvailable: true,
      },
      {
        restaurantId: restaurants[5]._id,
        name: 'Dim Sum Platter',
        description: 'Assorted dumplings, spring rolls, and steamed buns',
        price: 16.99,
        category: 'Dim Sum',
        images: ['https://via.placeholder.com/300?text=Dim+Sum'],
        rating: 4.8,
        isAvailable: true,
      },
    ];

    await Dish.insertMany(dishes);
    console.log(`✓ Created ${dishes.length} dishes`);

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
