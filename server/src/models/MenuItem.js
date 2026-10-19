import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Bowls', 'Juices', 'Toast', 'Snacks', 'Beverages'],
        message: '{VALUE} is not a supported category',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than zero'],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    ingredients: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for fast category filtering on available items
menuItemSchema.index({ category: 1, isAvailable: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
