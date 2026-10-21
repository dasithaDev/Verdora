import MenuItem from '../models/MenuItem.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Supported menu categories matching schema enum
 */
export const VALID_CATEGORIES = ['Bowls', 'Juices', 'Toast', 'Snacks', 'Beverages'];

/**
 * List menu items with search, category filtering, sorting, and pagination.
 * Route: GET /api/v1/menu
 * Access: Public
 */
export const getMenuItems = async (req, res, next) => {
  try {
    const { category, search, sortBy, order, includeUnavailable } = req.query;

    const filter = {};

    // Only admins may request unavailable items; customers always see available items only
    if (includeUnavailable !== 'true' || !req.user || req.user.role !== 'admin') {
      filter.isAvailable = true;
    }

    // Category filter
    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return sendError(
          res,
          400,
          'VALIDATION_ERROR',
          `Invalid category. Supported categories: ${VALID_CATEGORIES.join(', ')}`,
          [{ field: 'category', message: `Must be one of ${VALID_CATEGORIES.join(', ')}` }]
        );
      }
      filter.category = category;
    }

    // Search query (case-insensitive substring match on name)
    if (search && typeof search === 'string' && search.trim().length > 0) {
      // Escape special regex characters to prevent regex injection
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escapedSearch, $options: 'i' };
    }

    // Sort order
    const sortField = sortBy === 'price' ? 'price' : 'createdAt';
    const sortDirection = order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortDirection };

    // Pagination (from validatePagination middleware or query defaults)
    const page = req.pagination?.page || Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = req.pagination?.limit || Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      MenuItem.find(filter).sort(sortOptions).skip(skip).limit(limit),
      MenuItem.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limit) || 1;

    return sendSuccess(res, 200, {
      items,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single menu item by ID.
 * Route: GET /api/v1/menu/:id
 * Access: Public
 */
export const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return sendError(res, 404, 'NOT_FOUND', 'Menu item not found.');
    }

    return sendSuccess(res, 200, { item });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new menu item.
 * Route: POST /api/v1/menu
 * Access: Admin only
 */
export const createMenuItem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      imageUrl,
      ingredients,
      allergens,
      calories,
      isAvailable,
    } = req.body;

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        [{ field: 'category', message: `Must be one of ${VALID_CATEGORIES.join(', ')}` }]
      );
    }

    // Validate price
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'Price must be a positive number greater than 0.',
        [{ field: 'price', message: 'Price must be greater than 0' }]
      );
    }

    const newItem = await MenuItem.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      category,
      price: numericPrice,
      imageUrl: imageUrl ? imageUrl.trim() : '',
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      allergens: Array.isArray(allergens) ? allergens : [],
      calories: calories !== undefined && calories !== null ? Number(calories) : null,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    return sendSuccess(res, 201, {
      message: 'Menu item created successfully.',
      item: newItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing menu item.
 * Route: PATCH /api/v1/menu/:id
 * Access: Admin only
 */
export const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return sendError(res, 404, 'NOT_FOUND', 'Menu item not found.');
    }

    const {
      name,
      description,
      category,
      price,
      imageUrl,
      ingredients,
      allergens,
      calories,
      isAvailable,
    } = req.body;

    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category)) {
        return sendError(
          res,
          400,
          'VALIDATION_ERROR',
          `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
          [{ field: 'category', message: `Must be one of ${VALID_CATEGORIES.join(', ')}` }]
        );
      }
      item.category = category;
    }

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return sendError(
          res,
          400,
          'VALIDATION_ERROR',
          'Price must be a positive number greater than 0.',
          [{ field: 'price', message: 'Price must be greater than 0' }]
        );
      }
      item.price = numericPrice;
    }

    if (name !== undefined) item.name = name.trim();
    if (description !== undefined) item.description = description.trim();
    if (imageUrl !== undefined) item.imageUrl = imageUrl.trim();
    if (ingredients !== undefined) item.ingredients = Array.isArray(ingredients) ? ingredients : [];
    if (allergens !== undefined) item.allergens = Array.isArray(allergens) ? allergens : [];
    if (calories !== undefined) item.calories = calories !== null ? Number(calories) : null;
    if (isAvailable !== undefined) item.isAvailable = Boolean(isAvailable);

    await item.save();

    return sendSuccess(res, 200, {
      message: 'Menu item updated successfully.',
      item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete (deactivate) a menu item.
 * Route: DELETE /api/v1/menu/:id
 * Access: Admin only
 * Note: Keeps the record in MongoDB to preserve historical order integrity.
 */
export const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return sendError(res, 404, 'NOT_FOUND', 'Menu item not found.');
    }

    item.isAvailable = false;
    await item.save();

    return sendSuccess(res, 200, {
      message: 'Menu item deactivated successfully (soft-deleted).',
      item,
    });
  } catch (error) {
    next(error);
  }
};
