const express = require("express"),
	socketio = require("socket.io"),
	http = require("http"),
	cookieParser = require("cookie-parser"),
	session = require("express-session");

const UserModel = require("./app/Model/User");

let sessionMW = session({
	secret: "AlphaOmega",
	resave: false,
	saveUninitialized: false,
});
// Creating express app
const app = express();
app.use(cookieParser());
app.use(express.static("./"));

// Creating http server
const server = http.createServer(app);

// Creating socket io
const io = socketio(server);

io.use((socket, next) => {
	sessionMW(socket.request, socket.request.res, next);
});
io.on("connection", (socket) => {
	console.log("New WebSocket Created!!");
	var req = socket.request;

	// Sign up user
	socket.on("sign_up", async (data) => {
		let user = await UserModel.save(data);
		socket.emit("message", `Account registered successfully for ${user.email}`);
	});
	// Login user
	socket.on("login", async (data) => {
		let user = await UserModel.findByEmail(data.email);
		if (user.password == data.password) {
			socket.emit("message", `Login successful for ${user.email}`);
			req.session.user = user.email;
			req.session.save();
		} else {
			socket.emit("message", `Login failed for ${user.email}`);
		}
	});

	// Runs when user disconnects
	socket.on("disconnect", () => {
		// Send users list and room info
		req.session.user = undefined;
		req.session.save();
		console.log("User session terminated");
	});
});

// Creating a server to run on port 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log("Server running on port 3000"));
