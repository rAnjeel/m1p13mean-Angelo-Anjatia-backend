const express = require("express")
const cors = require("cors")
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

module.exports = app
