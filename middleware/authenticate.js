// const jwt = require("jsonwebtoken");
// const User = require("../models/userSchema");
import jwt from "jsonwebtoken";
import User from "../models/userSchema.js";

const verifyToken = async (req, res, next) => {
  let token;
  //   console.log("header", req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(420).json({ error: "No user found with this id" });
    }
    if (user.accessToken !== token)
      return res
        .status(420)
        .json({ error: "Unable to authorize. Please login" });
    req.user = user;

    next();
  } catch (err) {
    // console.log("verify token", err);
    return res.status(404).json({ error: "Not authorized " });
  }
};

// module.exports = verifyToken;
export default verifyToken;
