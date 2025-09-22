import mongoose from 'mongoose'

const GuideSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: String,
  address: String,
  preferredLocation: String,
  certificateId: String,
  languagesKnown: String,
  experienceYears: { type: Number, default: 0 },
  passwordHash: String, // For demo; use proper hashing in production
  photo: {
    filename: String,
    mimetype: String,
    size: Number,
  },
  certificate: {
    filename: String,
    mimetype: String,
    size: Number,
  },
  bank: {
    accountName: String,
    accountNumber: String,
    ifsc: String,
    bankName: String,
    branch: String,
    updatedAt: Date,
  },
  availability: {
    available: { type: Boolean, default: true },
    note: String,
  },
  messages: [
    {
      from: String,
      text: String,
      time: { type: Date, default: Date.now },
    }
  ],
  feedbacks: [
    {
      user: String,
      rating: Number,
      comment: String,
    }
  ],
  transactions: [
    {
      amount: Number,
      method: String,
      ref: String,
      date: { type: Date, default: Date.now },
    }
  ],
}, { timestamps: true })

export default mongoose.model('Guide', GuideSchema)
