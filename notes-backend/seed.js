import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Tenant from "./models/Tenant.js";
import User from "./models/User.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Tenant.deleteMany();
    await User.deleteMany();

    const acme = await Tenant.create({
      name: "Acme",
      slug: "acme",
      plan: "FREE",
    });
    const globex = await Tenant.create({
      name: "Globex",
      slug: "globex",
      plan: "FREE",
    });

    const hashedPassword = await bcrypt.hash("password", 10);

    await User.create([
      {
        name: "Acme Admin",
        email: "admin@acme.test",
        password: hashedPassword,
        role: "ADMIN",
        tenant: acme._id,
      },
      {
        name: "Acme User",
        email: "user@acme.test",
        password: hashedPassword,
        role: "MEMBER",
        tenant: acme._id,
      },
      {
        name: "Globex Admin",
        email: "admin@globex.test",
        password: hashedPassword,
        role: "ADMIN",
        tenant: globex._id,
      },
      {
        name: "Globex User",
        email: "user@globex.test",
        password: hashedPassword,
        role: "MEMBER",
        tenant: globex._id,
      },
    ]);

    console.log("✅ Seed complete");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
