import { body } from 'express-validator';

export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim()
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const validateRestaurant = [
  body('name').trim().notEmpty().withMessage('Restaurant name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('cuisineTypes').isArray().withMessage('Cuisine types must be an array'),
  body('phone').optional().trim()
];

export const validateDish = [
  body('name').trim().notEmpty().withMessage('Dish name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').trim().notEmpty().withMessage('Category is required')
];

export const validateReview = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
];
