const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../constants/roles");

async function seedDefaultUsers() {
    console.log("Checking default users...");

    const defaultUsers = [
        { username: "superadmin", role: ROLES.SUPER_ADMIN },
        { username: "trafficadmin", role: ROLES.TRAFFIC_ADMIN },
        { username: "electricityadmin", role: ROLES.ELECTRICITY_ADMIN },
        { username: "wateradmin", role: ROLES.WATER_ADMIN },
        { username: "lightingadmin", role: ROLES.LIGHTING_ADMIN },
        { username: "cctv", role: ROLES.CCTV_OPERATOR },
        { username: "security", role: ROLES.SECURITY_ANALYST }
    ];

    for (const userData of defaultUsers) {
        const existingUser = await User.findOne({ username: userData.username.toLowerCase() });

        if (!existingUser) {
            await User.create({
                username: userData.username.toLowerCase(),
                password: "Password123",
                role: userData.role,
                phoneNumber: "9999999999",
                phoneVerified: true,
                deviceTrustScore: 100,
                failedLoginAttempts: 0,
                accountLocked: false
            });
            console.log(`Created user: ${userData.username}`);
        } else {
            await User.updateOne(
                { _id: existingUser._id },
                {
                    $set: {
                        password: await bcrypt.hash("Password123", 10),
                        role: userData.role,
                        phoneNumber: existingUser.phoneNumber || "9999999999",
                        phoneVerified: true,
                        deviceTrustScore: 100,
                        failedLoginAttempts: 0,
                        accountLocked: false
                    }
                }
            );
            console.log(`Refreshed default credentials for: ${userData.username}`);
        }
    }

    console.log("Default user check complete.");
}

module.exports = seedDefaultUsers;
