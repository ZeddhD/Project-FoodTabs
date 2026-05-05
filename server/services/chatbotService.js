// Chatbot service — tries DB rules first, falls back to built-in rules
import ChatbotRule from '../models/ChatbotRule.js';

const BUILTIN_INTENTS = [
  {
    keywords: ['verified', 'badge', 'verified visit', 'how to get verified'],
    response: 'Your review gets a **Verified Visit** badge automatically when you have a completed booking at that restaurant through our platform. No action needed — the system checks your booking history and adds the badge when you submit the review.'
  },
  {
    keywords: ['reserve', 'reservation', 'book a table', 'table booking', 'book', 'table', 'seat'],
    response: 'To reserve a table, open any restaurant profile and tap **Reserve a Table**. Select your date, choose an available time slot, enter your party size, and complete the payment. You will receive a confirmation immediately.'
  },
  {
    keywords: ['cancel', 'cancellation', 'cancel booking', 'refund'],
    response: 'You can cancel a booking from **My Bookings** in your profile. If you cancel more than 24 hours before your reservation you receive a full refund. Cancellations within 24 hours are non-refundable. Refunds may take 5–7 business days.'
  },
  {
    keywords: ['event', 'special event', 'book event', 'event booking'],
    response: 'Restaurants host special events like tasting nights and themed dinners. Find upcoming events on each restaurant\'s profile under the **Events** section. Tap **Book Seats**, select how many you need, and complete payment through Stripe.'
  },
  {
    keywords: ['review', 'write a review', 'how to review', 'leave review', 'rate', 'rating'],
    response: 'Visit a restaurant\'s profile page and click **Write a Review**. You can rate individual dishes, score the restaurant across five criteria (Taste, Hygiene, Service, Ambience, Value), and upload photos.'
  },
  {
    keywords: ['fake review', 'report', 'flag', 'suspicious review'],
    response: 'Tap the **Report** button on any review, post, or comment. Select the reason and our moderation team reviews it within 24 hours. We take fake reviews very seriously — the Verified Visit badge helps keep reviews authentic.'
  },
  {
    keywords: ['list restaurant', 'add restaurant', 'owner', 'register restaurant', 'vendor'],
    response: 'To list your restaurant on Food Tabs, tap **List Your Restaurant** on the homepage and fill in your details. Upload your trade license, NID, and restaurant photos. Our team reviews all applications and you\'ll hear back within 48 hours.'
  },
  {
    keywords: ['payment', 'pay', 'stripe', 'card'],
    response: 'We use **Stripe** for secure payments. Your card details are never stored on our servers. For testing use card number **4242 4242 4242 4242** with any future expiry and any 3-digit CVV.'
  },
  {
    keywords: ['recommendation', 'suggest', 'what to try', 'personalized', 'for you'],
    response: 'Your homepage feed is personalized based on your review history, bookmarks, and cuisine preferences. The more you interact, the better your recommendations become. You can update your cuisine preferences in your **Profile Settings**.'
  },
  {
    keywords: ['forum', 'community', 'post', 'discussion'],
    response: 'The **Community** tab is our forum where food lovers discuss the best places in Dhaka. Post in categories like Best in City, Hidden Gems, Ask the Community, and more. Upvote helpful posts and join the conversation.'
  },
  {
    keywords: ['account', 'sign up', 'register', 'login', 'password'],
    response: 'Create a free account by tapping **Sign Up** and entering your name, email, and password. Forgot your password? Use the **Forgot Password** link on the login page to reset it via email.'
  },
  {
    keywords: ['contact', 'help', 'support', 'problem', 'issue'],
    response: 'If you have an issue the chatbot can\'t resolve, use the **Report** button on any content to flag it for our team, or email **support@foodtabs.com**. We aim to respond within 24 hours on business days.'
  }
];

const DEFAULT_RESPONSE =
  'I can help with:\n• Restaurant recommendations\n• Table & event bookings\n• Writing reviews\n• Saving favourites\n• Community forum\n• Payments & support\n\nWhat would you like to know?';

/**
 * Detect intent from user message.
 * Checks DB rules first, then falls back to built-in rules.
 * @param {string} message
 * @returns {Promise<string>}
 */
export async function detectIntent(message) {
  if (!message || typeof message !== 'string') return DEFAULT_RESPONSE;
  const lower = message.toLowerCase();

  // 1. Try DB rules
  try {
    const dbRules = await ChatbotRule.find({ isActive: true });
    for (const rule of dbRules) {
      if (rule.triggers.some(kw => lower.includes(kw.toLowerCase()))) {
        return rule.response;
      }
    }
  } catch {
    // DB unavailable — fall through to built-in rules
  }

  // 2. Built-in fallback
  for (const intent of BUILTIN_INTENTS) {
    if (intent.keywords.some(kw => lower.includes(kw))) {
      return intent.response;
    }
  }

  return DEFAULT_RESPONSE;
}
