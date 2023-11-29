import mongoose from "mongoose";
const ClientSchema = new mongoose.Schema(
  {
    client_code: {
      type: String,
    },
    client_name: {
      type: String,
    },
    marketer: {
      type: String,
    },
    contact_person: {
      type: String,
    },
    designation: {
      type: String,
    },
    contact_number: {
      type: String,
    },
    email: {
      type: String,
    },
    country: {
      type: String,
    },
    address: {
      type: String,
    },
    prices: {
      type: String,
    },
    currency: {
      type: String,
    },
    last_invoice_number: {
      type: String,
      default: null,
    },
    updated_by: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Client || mongoose.model("Client", ClientSchema);
