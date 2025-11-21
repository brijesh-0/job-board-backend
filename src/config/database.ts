import mongoose from "mongoose";
import { exit } from "process";

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/job-board";

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB connected successfully");

    // Create indexes
    await createIndexes();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const createIndexes = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;

    if (!db) {
      exit(0);
    }

    // await db.collection("jobs").dropIndex("title_text_description_text"); // to delete indexes (for testing only)

    // Text index for job search (includes company name)
    await db.collection("jobs").createIndex(
      {
        title: "text",
        description: "text",
        "company.name": "text",
      },
      {
        weights: {
          title: 10,
          description: 5,
          "company.name": 8,
        },
      },
    );

    // Other indexes
    await db
      .collection("jobs")
      .createIndex({ location: 1, isRemote: 1, "salary.min": 1 });

    await db
      .collection("applications")
      .createIndex({ jobId: 1, candidateId: 1 }, { unique: true });

    await db
      .collection("applications")
      .createIndex({ employerId: 1, status: 1 });

    await db.collection("users").createIndex({ email: 1 }, { unique: true });

    console.log("✅ Database indexes created");
  } catch (error) {
    console.error("⚠️  Index creation warning:", error);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("❌ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});
