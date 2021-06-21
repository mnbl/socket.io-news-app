const express = require("express"),
	socketio = require("socket.io"),
	http = require("http"),
	cookieParser = require("cookie-parser"),
	session = require("express-session");

const UserModel = require("./app/Model/User");
const NewsModel = require("./app/Model/News");

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
	socket.emit("message", "New websocket created");
	console.log("New WebSocket Created!!");
	var req = socket.request;

	// Sign up user
	// Data in json format with keys: [email{string}, password{string}]
	socket.on("sign_up", async (data) => {
		let user = await UserModel.save(data);
		socket.emit("message", `Account registered successfully for ${user.email}`);
	});

	// Login user
	// Data in json format with keys: [email{string}, password{string}]
	socket.on("login", async (data) => {
		let user = await UserModel.findByEmail(data.email);
		if (user.password == data.password) {
			socket.emit("message", `Login successful for ${user.email}`);
			req.session.user = user;
			req.session.save();
		} else {
			socket.emit("message", `Login failed for ${user.email}`);
		}
	});

	// Add news
	// Data in json format with keys: [title{string}, content{string}, author{author id from session}]
	socket.on("add_news", async (data) => {
		if (req.session.user !== undefined) {
			let item = {
				title: data.title,
				content: data.content,
				author: req.session.user._id,
			};
			let news = await NewsModel.save(item);
			if (news) {
				socket.emit("message", `News entered with title ${news.title}`);
			} else {
				socket.emit("message", "Error in saving News");
			}
		} else {
			console.log("User is not logged in!! Login to add News");
			socket.emit("message", `User is not logged in!! Login to add News`);
		}
	});

	// find all news for today
	socket.on("todays_news", async () => {
		let news = await NewsModel.findTodayNews();
		console.log(news);
	});

	// update news content
	// Data in json format with keys: [id{mongodb _id}, content{string}]
	socket.on("update_news_content", async (data, content) => {
		if (req.session.user !== undefined) {
			let news = await NewsModel.update(data.id, req.session.user._id, data.content);
			if (news.nModified > 0) {
				socket.emit("message", `News entered with title ${news.title}`);
			} else {
				socket.emit("message", "Error in saving News");
			}
		} else {
			console.log("User is not logged in!! Login to edit News");
			socket.emit("message", `User is not logged in!! Login to edit News`);
		}
	});

	// Finding news by id
	// Data in format: id{string}
	socket.on("find_by_id", async (id) => {
		console.log(await NewsModel.findById(id));
	});

	// Adding comment to news
	// Data in json format with keys: [id{mongodb _id}, content{string}]
	socket.on("add_comment", async (data) => {
		if (req.session.user !== undefined) {
			let comment = {
				by: req.session.user._id,
				content: data.content,
			};
			let news = await NewsModel.addComment(data.id, comment);
			if (news) {
				socket.emit("message", `Comment entered in News title ${news.title}`);
			} else {
				socket.emit("message", "Error in ading comment!!");
			}
		} else {
			console.log("User is not logged in!! Login to add comment");
			socket.emit("message", `User is not logged in!! Login to add comment`);
		}
	});

	// Runs when user disconnects
	socket.on("disconnect", () => {
		// Send users list and room info
		req.session.user = undefined;
		req.session.save();
		socket.emit("message", "User session terminated");
		console.log("User session terminated");
	});
});

// Creating a server to run on port 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log("Server running on port 3000"));
