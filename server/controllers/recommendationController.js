// Thin controller — all business logic lives in recommendationService.js
import * as recommendationService from '../services/recommendationService.js';
import { sendResponse } from '../utils/helpers.js';

export const getRecommendations = async (req, res, next) => {
  try {
    const data = await recommendationService.getPersonalised(req.user.userId, req.query);
    sendResponse(res, 200, true, 'Recommendations fetched', data);
  } catch (error) { next(error); }
};

export const getSimilarUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const data  = await recommendationService.getSimilarUsers(req.user.userId, limit);
    sendResponse(res, 200, true, 'Similar users fetched', data);
  } catch (error) { next(error); }
};

export const getTrendingRestaurants = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const days  = parseInt(req.query.days)  || 30;
    const data  = await recommendationService.getTrending(limit, days);
    sendResponse(res, 200, true, 'Trending restaurants fetched', data);
  } catch (error) { next(error); }
};

export const getSmartRecommendations = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const data  = await recommendationService.getSmart(req.user.userId, limit);
    sendResponse(res, 200, true, 'Smart recommendations fetched', data);
  } catch (error) { next(error); }
};

export const getRecommendedDishes = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const data  = await recommendationService.getRecommendedDishes(req.user.userId, limit);
    sendResponse(res, 200, true, 'Dish recommendations fetched', data);
  } catch (error) { next(error); }
};

export const getTasteProfile = async (req, res, next) => {
  try {
    const data = await recommendationService.getTasteProfile(req.user.userId);
    sendResponse(res, 200, true, 'Taste profile fetched', data);
  } catch (error) { next(error); }
};
