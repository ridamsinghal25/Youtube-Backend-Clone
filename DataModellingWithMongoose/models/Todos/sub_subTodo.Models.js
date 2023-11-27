import mongoose, { mongo } from "mongoose";

const sub_subTodoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    complete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Sub_SubTodo = mongoose.model("Sub_SubTodo", sub_subTodoSchema);
