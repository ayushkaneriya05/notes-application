import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  plan: { type: String, enum: ["FREE", "PRO"], default: "FREE" },
});

export default mongoose.model("Tenant", tenantSchema);
