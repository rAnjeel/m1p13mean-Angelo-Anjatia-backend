const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connecte"))
  .catch((err) => console.log(err));

module.exports = mongoose;
