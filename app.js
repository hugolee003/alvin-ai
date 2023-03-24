const express = require('express')
const http = require('http')
const cors = require("cors");
const session = require('express-session')
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongodb-session')(session)
const bot = require('./helper')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = new Server(server)
const PORT = process.env.PORT;
const DB = process.env.DB;
const SECRET = process.env.SECRET;
require("./db")(DB);

const store = new MongoStore({
  uri: DB,
  collection: "sessions",
});

store.on("error", function (error) {
  console.log(error);
});

const sessionMid = session({
  secret: SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, httpOnly: true }, // Set secure to true if using HTTPS
});


app.use(sessionMid)
app.use(cookieParser())
app.use(cors())
app.use(express.static("public"));

io.engine.use(sessionMid);

io.on("connection", (socket) => {
  const request = socket.request;
  console.log("A user connected", socket.id, request.session.id );

  // Send a welcome message to the user
  socket.emit("response", "Welcome to Alvin-AI. Please select an option:\n\n1. Place an order\n99. Checkout order\n98. See order history\n97. See current order\n0. Cancel order");
 


  socket.on("request", function (data) {
    const [response, modified] = bot.getResponse(data, request.session.data, store);
    request.session.data = modified;
    socket.emit("response", response);
  })

  socket.on("disconnect", () => {
    request.session.save();
  })
})

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`)
})