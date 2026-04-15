const User = require("../models/User");

exports.bootstrapAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@nouveau.com";
    const adminPass  = process.env.ADMIN_PASS  || "Admin@Nouveau2024!";

    const exists = await User.findOne({ email: adminEmail });
    if (exists) {
      // Ensure admin role is set
      if (exists.role !== "admin") {
        await User.findByIdAndUpdate(exists._id, { role: "admin" });
        console.log("✅ Admin role updated for", adminEmail);
      }
      return;
    }

    await User.create({
      name:     "Nouveau Admin",
      email:    adminEmail,
      password: adminPass,
      role:     "admin",
    });
    console.log("✅ Admin user created:", adminEmail);
  } catch (err) {
    console.error("⚠️  Bootstrap admin error:", err.message);
  }
};
