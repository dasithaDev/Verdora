import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: [true, 'Menu item reference ID is required'],
    },
    itemNameSnapshot: {
      type: String,
      required: [true, 'Item name snapshot is required'],
      trim: true,
    },
    unitPriceSnapshot: {
      type: Number,
      required: [true, 'Unit price snapshot is required'],
      min: [0.01, 'Unit price snapshot must be greater than zero'],
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [99, 'Quantity cannot exceed 99 items per line'],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for order'],
      index: true,
    },
    items: {
      type: [orderItemSnapshotSchema],
      required: [true, 'Order must contain at least one item'],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'Order items array cannot be empty',
      },
    },
    subtotal: {
      type: Number,
      required: [true, 'Authoritative subtotal is required'],
      min: [0.01, 'Subtotal must be greater than zero'],
    },
    status: {
      type: String,
      enum: {
        values: ['placed', 'preparing', 'ready', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid order status',
      },
      default: 'placed',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Order notes cannot exceed 300 characters'],
      default: '',
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

// Index to support fetching customer order history efficiently
orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
