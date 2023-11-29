import mongoose from "mongoose";
const InvoiceSchema = new mongoose.Schema(
  {
    client_id: {
      type: String,
    },
    client_code: {
      type: String,
    },
    created_by: {
      type: String,
    },
    time_period: {
      type: { fromDate: String, toDate: String },
    },
    total_orders: {
      type: Number,
    },
    invoice_number: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
