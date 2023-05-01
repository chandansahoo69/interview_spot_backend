const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const verifyToken = async (req, res, next) => {
    let token;
    // console.log(req.headers);
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }


    // const token =
    //     req.body.token || req.query.token || req.headers["x-access-token"];

    // console.log(token);
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
            return res.status(420).json({ error: "Unable to authorize. Please login" });
        req.user = user;

        next();
    } catch (err) {
        return res.status(404).json({ error: "Not authorized " });
    }
};
module.exports = verifyToken;
