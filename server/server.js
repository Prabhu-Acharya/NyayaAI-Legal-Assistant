require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const queryRoutes = require("./routes/queryRoutes");

app.use("/api", queryRoutes);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});