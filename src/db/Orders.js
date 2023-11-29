import mongoose from "mongoose";

function dateToday() {
  const options = {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const now = new Date();
  const localDate = now.toLocaleDateString("en-US", options);
  const [month, day, year] = localDate.split("/");

  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}

function timeNow() {
  const options = {
    timeZone: "Asia/Dhaka",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  };

  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const localTime = formatter.format(now);

  return localTime;
}

const OrderSchema = new mongoose.Schema(
  {
    date_today: {
      type: String,
      default: dateToday(),
    },
    time_now: {
      type: String,
      default: timeNow(),
    },
    client_code: {
      type: String,
    },
    client_name: {
      type: String,
    },
    folder: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    download_date: {
      type: String,
    },
    delivery_date: {
      type: String,
    },
    delivery_bd_time: {
      type: String,
    },
    task: {
      type: String,
    },
    et: {
      type: Number,
    },
    production: {
      type: String,
    },
    qc1: {
      type: Number,
    },
    comment: {
      type: String,
    },
    type: {
      type: String,
    },
    status: {
      type: String,
    },
    updated_by: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.models?.Order || mongoose.model("Order", OrderSchema);
