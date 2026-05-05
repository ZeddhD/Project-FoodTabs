import mongoose from 'mongoose';

// Admin-manageable chatbot rules — keyword triggers → response text
const chatbotRuleSchema = new mongoose.Schema({
  triggers:  [{ type: String }], // keywords that activate this rule
  response:  { type: String, required: true },
  isActive:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ChatbotRule', chatbotRuleSchema);
