import mongoose from "mongoose";

const subTodoSchema = new mongoose.Schema({}, { timestamps: true });

export const subTodo = mongoose.model("SubTodo", subTodoSchema);
