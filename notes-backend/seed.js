require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Tenant = require("./models/Tenant");
const User = require("./models/User");
const Note = require("./models/Note");

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not set in env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB for seeding");

  // Clear existing (CAUTION)
  await Note.deleteMany({});
  await User.deleteMany({});
  await Tenant.deleteMany({});

  // Create tenants
  const acme = await Tenant.create({
    name: "Acme",
    slug: "acme",
    plan: "free",
  });
  const globex = await Tenant.create({
    name: "Globex",
    slug: "globex",
    plan: "free",
  });

  const password = "password";
  const hash = await bcrypt.hash(password, 10);

  // Create users
  const usersData = [
    { email: "admin@acme.test", role: "admin", tenantId: acme._id },
    { email: "user@acme.test", role: "member", tenantId: acme._id },
    { email: "admin@globex.test", role: "admin", tenantId: globex._id },
    { email: "user@globex.test", role: "member", tenantId: globex._id },
  ];

  for (const u of usersData) {
    await User.create({
      email: u.email,
      passwordHash: hash,
      role: u.role,
      tenantId: u.tenantId,
    });
  }

  console.log("Seeded tenants and users. Test credentials:");
  console.log("Password for all test accounts: password");
  console.log("Accounts:");
  usersData.forEach((u) => console.log("-", u.email, "->", u.role));

  await mongoose.disconnect();
  console.log("Seeding complete.");
}

seed().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
