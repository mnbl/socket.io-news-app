"use strict";

const conn = require("../../Connection").on();
const UserSchema = require("../Schema/UserSchema");
const Model = conn.model("User", UserSchema);

class User extends Model {
	static async save(data) {
		try {
			let user = new User({
				email: data.email,
				password: data.password,
			});
			return await user.save();
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	static async findByEmail(email) {
		try {
			return await Model.findOne({ email: email });
		} catch (error) {
			console.log(error);
			return null;
		}
	}
}

module.exports = User;
