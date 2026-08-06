const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/expense-tracker").then(async () => {
  const db = mongoose.connection.db;
  const bills = await db.collection("bills").find({}).toArray();
  console.log("BILLS:", JSON.stringify(bills, null, 2));

  const installments = await db.collection("installments").find({}).toArray();
  console.log("INSTALLMENTS:", JSON.stringify(installments, null, 2));

  process.exit(0);
});
