import mongoose from "mongoose";

// +++++++++ Contributed by me
const hospitalHoursSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
  },
  hoursSpendInHospital: {
    type: Number,
    default: 0,
  },
});
// ++++++++

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
    },
    experenceInYears: {
      type: Number,
      required: true,
      default: 0,
    },
    worksInHosiptals: [hospitalHoursSchema],
  },
  { timestamps: true }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
