// Switch to database
db = db.getSiblingDB("employeeTracker");

// ----------------------------
// Create users collection
// ----------------------------
if (!db.getCollectionNames().includes("users")) {
    db.createCollection("users");
    print("✓ users collection created");
} else {
    print("✓ users collection already exists");
}

// ----------------------------
// Create worksessions collection
// ----------------------------
if (!db.getCollectionNames().includes("worksessions")) {
    db.createCollection("worksessions");
    print("✓ worksessions collection created");
} else {
    print("✓ worksessions collection already exists");
}

// ----------------------------
// Create Indexes
// ----------------------------

// users
db.users.createIndex(
    { email: 1 },
    { unique: true }
);

db.users.createIndex(
    { username: 1 },
    { unique: true }
);

print("✓ User indexes created");

// worksessions
// No custom indexes yet

print("✓ Database initialization completed.");