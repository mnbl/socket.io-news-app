"use strict";

const Schema = require("mongoose").Schema;

const UserSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
			unique: true,
		},
		content: {
			type: String,
			required: true,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		comments: [
			{
				by: {
					type: Schema.Types.ObjectId,
					ref: "User",
				},
				content: {
					type: String,
				},
			},
		],
	},
	{ timestamps: true }
);

module.exports = UserSchema;
