const express = require("express")
const cors = require("cors")
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const shopRoutes = require("./routes/shops")

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/shops", shopRoutes)

module.exports = app
