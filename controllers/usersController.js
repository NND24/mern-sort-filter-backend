import users from "../models/usersSchema.js";
import moment from "moment";
import csv from "fast-csv";
import fs from "fs";
const BASE_URL = process.env.BASE_URL;

export const userpost = async (req, res) => {
  const file = req.file.filename;
  const { fname, lname, email, mobile, gender, location, status } = req.body;

  if (!fname || !lname || !email || !mobile || !gender || !location || !status || !file) {
    res.status(401).json("All inputs are required");
    return;
  }

  try {
    const peruser = await users.findOne({ email: email });
    if (peruser) {
      res.status(401).json("User already exists");
    } else {
      const dateCreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

      const userData = new users({
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        dateCreated,
      });
      await userData.save();
      res.status(200).json(userData);
    }
  } catch (error) {
    res.status(401).json(error);
    console.log("catch block error", error);
  }
};

export const userget = async (req, res) => {
  const search = req.query.search || "";
  const gender = req.query.gender || "";
  const status = req.query.status || "";
  const sort = req.query.sort || "";
  const page = req.query.page || 1;
  const ITEM_PER_PAGE = 2;

  const query = {
    fname: { $regex: search, $options: "i" },
  };

  if (gender !== "All") {
    query.gender = gender;
  }

  if (status !== "All") {
    query.status = status;
  }

  try {
    const skip = (page - 1) * ITEM_PER_PAGE;
    const count = await users.countDocuments(query);
    console.log(count);

    const usersdata = await users
      .find(query)
      .sort({ dateCreated: sort == "new" ? -1 : 1 })
      .limit(ITEM_PER_PAGE)
      .skip(skip);

    const pageCount = Math.ceil(count / ITEM_PER_PAGE);
    res.status(200).json({
      Pagination: {
        count,
        pageCount,
      },
      usersdata,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

export const singleuserget = async (req, res) => {
  const { id } = req.params;
  try {
    const userdata = await users.findOne({ _id: id });
    res.status(200).json(userdata);
  } catch (error) {
    res.status(401).json(error);
  }
};

export const useredit = async (req, res) => {
  const { id } = req.params;
  const { fname, lname, email, mobile, gender, location, status, user_profile } = req.body;
  const file = req.file ? req.file.filename : user_profile;

  const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const updateuser = await users.findByIdAndUpdate(
      { _id: id },
      {
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        dateUpdated,
      },
      {
        new: true,
      }
    );

    await updateuser.save();
    res.status(200).json(updateuser);
  } catch (error) {
    res.status(401).json(error);
  }
};

export const userdelete = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteuser = await users.findByIdAndDelete({ _id: id });
    res.status(200).json(deleteuser);
  } catch (error) {
    res.status(401).json(error);
  }
};

export const userstatus = async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  try {
    const userstateupdate = await users.findByIdAndUpdate({ _id: id }, { status: data }, { new: true });
    res.status(200).json(userstateupdate);
  } catch (error) {
    res.status(401).json(error);
  }
};

export const userExport = async (req, res) => {
  try {
    const usersdata = await users.find();

    const csvStream = csv.format({ headers: true });

    if (!fs.existsSync("public/files/export/")) {
      if (!fs.existsSync("public/files")) {
        fs.mkdirSync("public/files/");
      }
      if (!fs.existsSync("public/files/export")) {
        fs.mkdirSync("./public/files/export/");
      }
    }

    const writablestream = fs.createWriteStream("public/files/export/users.csv");

    csvStream.pipe(writablestream);

    writablestream.on("finish", function () {
      res.json({
        downloadUrl: `${BASE_URL}/files/export/users.csv`,
      });
    });
    if (usersdata.length > 0) {
      usersdata.map((user) => {
        csvStream.write({
          FirstName: user.fname ? user.fname : "-",
          LastName: user.lname ? user.lname : "-",
          Email: user.email ? user.email : "-",
          Phone: user.mobile ? user.mobile : "-",
          Gender: user.gender ? user.gender : "-",
          Status: user.status ? user.status : "-",
          Profile: user.profile ? user.profile : "-",
          Location: user.location ? user.location : "-",
          DateCreated: user.dateCreated ? user.dateCreated : "-",
          DateUpdated: user.dateUpdated ? user.dateUpdated : "-",
        });
      });
    }
    csvStream.end();
    writablestream.end();
  } catch (error) {
    res.status(401).json(error);
  }
};
