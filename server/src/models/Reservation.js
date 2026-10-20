import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for reservation'],
      index: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CafeTable',
      required: [true, 'Assigned table ID is required'],
      index: true,
    },
    reservationDate: {
      type: Date,
      required: [true, 'Reservation date is required'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be formatted as HH:mm (24-hour)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be formatted as HH:mm (24-hour)'],
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'Guest count must be at least 1'],
      max: [20, 'Maximum party size is 20 guests'],
    },
    status: {
      type: String,
      enum: {
        // 'pending' is intentionally excluded: reservations are auto-confirmed on creation.
        // See ARCHITECTURE.md §3.2 Reservation Lifecycle.
        values: ['confirmed', 'cancelled', 'rejected', 'completed'],
          message: '{VALUE} is not a valid reservation status',
      },
      default: 'confirmed',
      index: true,
    },
    specialRequest: {
      type: String,
      trim: true,
      maxlength: [300, 'Special request cannot exceed 300 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        // Serialize reservationDate as a plain YYYY-MM-DD string so clients
        // receive a predictable date-only value instead of a full ISO timestamp.
        if (ret.reservationDate instanceof Date) {
          const d = ret.reservationDate;
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          ret.reservationDate = `${yyyy}-${mm}-${dd}`;
        }
        return ret;
      },
    },
  }
);

// Compound index to optimize interval overlap conflict checks
reservationSchema.index({ tableId: 1, reservationDate: 1, status: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;
