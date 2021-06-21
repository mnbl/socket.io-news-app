"use strict";

const conn = require("../../Connection").on();
const NewsSchema = require("../Schema/NewsSchema");
const Model = conn.model("News", NewsSchema);

const moment = require("moment");

class News extends Model {
	static async save(data) {
		try {
			let news = new News({
				title: data.title,
				content: data.content,
				author: data.author,
			});
			return await news.save();
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	static async update(id, author, content) {
		try {
			let data = {
				content: content,
			};
			return await Model.updateOne({ _id: id, author: author }, { $set: data });
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	static async findById(id) {
		try {
			return await Model.findOne({ _id: id }).populate("User", { id: 1, email: 1 });
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	static async findTodayNews() {
		try {
			let start = moment().startOf("day");
			let end = moment().endOf("day");
			return await Model.find({ createdAt: { $gte: start, $lt: end } });
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	static async addComment(id, comment) {
		try {
			let news = await Model.findOne({ _id: id });
			news.comments.push(comment);
			await news.save();
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	// static async updateComment(news_id, comment_id, comment) {
	// 	try {
	// 		let comment = await Model.findOne({ comments: { _id: comment_id } });
	// 		// return await Model.updateOne({ comments: { _id: comment_id } }, {$set: });
	// 		await news.save();
	// 	} catch (error) {
	// 		console.log(error);
	// 		return null;
	// 	}
	// }
}

module.exports = News;
