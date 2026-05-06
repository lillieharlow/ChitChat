import { getPricingInfo } from "../index.js";

async function run() {
  try {
    const queries = [
      "support worker hourly rate",
      "weekend rate",
      "group training",
      "nonexistent pricing item to test fallback",
    ];

    for (const q of queries) {
      console.log("--- Query:", q);
      const result = await getPricingInfo(q);
      console.log(result);
      console.log();
    }

    console.log("✅ Pricing tests finished.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Pricing test failed:", err);
    process.exit(2);
  }
}

run();
