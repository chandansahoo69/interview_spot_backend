const { default: mongoose, Mongoose } = require("mongoose");
require("dotenv").config();
const User = require("../models/userSchema");
const Notification = require("../models/notificationSchema");
const jwt = require("jsonwebtoken");
const passwordValidator = require('password-validator');
const Designation = require("../models/designationSchema");

//password validator schema

//***** */
let schema = new passwordValidator();
schema
    .is().min(8)
    .is().max(30)
    .has().uppercase()
    .has().lowercase()
    .has().digits(2)
    .has().symbols(1)
    .has().not().spaces()
    .is().not().oneOf(['Passw0rd', 'Password123']);


//register controller --- Only Available to HR
exports.register = async (req, res) => {

    const admin = req.user;
    if (admin.role !== "HR") {
        return res.status(403).json({ message: "Only HRs are allowed to access this route and register employees" })
    }
    try {
        const { username, officialEmail, password, role, phoneNumber, dateOfBirth, employeeID, designation, reportingPerson, personalEmail, dateOfJoining } = req.body;
        if (!(username && officialEmail && password && role && phoneNumber && dateOfBirth && designation && employeeID && dateOfJoining)) {
            return res.status(422).json({ error: "Username/OfficialEmail/Password/Role/Phone/DateOfBirth/DateOfJoining/ReportingPerson are mandatory" });
        }

        // console.log(schema.validate(password))


        const userEmailExists = await User.findOne({ email: officialEmail });
        const userPhoneExists = await User.findOne({ phoneNumber: phoneNumber });
        const employeeExists = await User.findOne({ employeeID: employeeID });

        if (userEmailExists) {
            return res
                .status(422)
                .json({ error: "A User with this email already exists." });
        }

        if (userPhoneExists) {
            return res
                .status(422)
                .json({ error: "A User with this phone already exists." });
        }
        if (employeeExists) {
            return res
                .status(422)
                .json({ error: "A User with this Employee ID already exists." });
        }

        if (!(schema.validate(password))) {
            return res
                .status(422)
                .json({ error: "Password must contain at least 8 characters, 2 digits, 1 symbol, 1 uppercase and 1 lowercase letter." });
        }

        //check if valid designation and reporting person provided
        const designatioExists = await Designation.findOne({ _id: designation })
        if (!designatioExists)
            return res.status(403).json({ message: "Designation does not exists" });

        designatioExists.canBeDeleted == true ? designatioExists.canBeDeleted = false : null;
        await designatioExists.save();

        const reportingPersonExists = await User.findOne({ _id: reportingPerson })
        if (!reportingPersonExists)
            return res.status(403).json({ message: "Reporting Person does not exists" })


        const user = new User({
            username,
            email: officialEmail,
            password,
            role,
            designation: mongoose.Types.ObjectId(designation),
            phoneNumber,
            dateOfBirth: new Date(dateOfBirth * 1000).toUTCString(),
            employeeID,
            personalEmail,
            reportingPerson: mongoose.Types.ObjectId(reportingPerson),
            dateOfJoining: new Date(dateOfJoining * 1000).toUTCString(),
        });
        await user.save();

        // ........ Send Notification to Admins ........

        // const admins = await User.find({ role: "HR" });
        // const adminIds = Mongoose.Types.ObjectId(admins.map((admin) => admin._id));
        // const adminIds = admins.map((admin) => admin._id);

        // const adminIds = admins.map((admin) => ({ userID: admin._id }));
        // console.log(adminIds);
        const userID = { userID: admin._id };
        const notification = new Notification({
            // to: user._id,
            to: userID,
            from: admin._id,
            message: `Hello ${user.username}, Welcome to the company.`,
        });
        await notification.save();

        // .......................

        res.status(200).json({
            success: true,
            message: "User Registered Successfully.",
            notification: "Notification Sent to the User"
        });


    } catch (error) {
        res.status(500).json({ message: "Error occurred while registering. Please try again later." });
        console.log(error.message);
    }
};

//login controller
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Empty Credentials!" });
    }
    try {
        const user = await User.findOne({ email });
        if (user) {
            //user locking functionality
            if (!user.isLocked) {
                if (user.loginAttempt >= 3) {
                    user.isLocked = true;
                    await user.save();
                    return res.status(403).json(
                        {
                            error: "The user has been locked out due to multiple login failure. " +
                                "Please contact Admin to unlock."
                        });
                }
                const passMatch = await user.matchPassword(password);
                if (!passMatch) {
                    user.loginAttempt += 1;
                    await user.save();
                    return res.status(400).json({ error: "Invalid Credentials!" });
                }
                //access and refresh tokens
                const accessToken = user.getSignedAccessToken();
                const refreshToken = user.getSignedRefreshToken();

                user.accessToken = accessToken;
                user.refreshToken = refreshToken;
                user.loginAttempt = 0;
                await user.save();


                res.status(200).json({
                    success: true,
                    accessToken,
                    refreshToken,
                    message: "Login Success",
                    user: {
                        userId: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        avtar: user.avtar
                    }
                });
            }
            else return res.status(400).json({ error: "The user is locked. Please unlock." });
        } else return res.status(400).json({ error: "User don't exists" });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
        console.log(err.message);
    }

};


//unlock user controller
exports.unlock = async (req, res) => {
    const admin = req.user;
    // console.log(admin);
    if (admin.role !== "Admin" && admin.role !== "HR") {
        return res.status(403).json({ message: "Only admins are allowed to unlock a user." })
    }
    else {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ error: "Empty Credentials!" });
        //admin will unlock the user
        try {
            const unlockUser = await User.findOne({ email });
            if (!unlockUser)
                return res.status(403).json({ message: "The  user with this mail doesnot exists." })
            // console.log(user)
            unlockUser.isLocked = false;
            unlockUser.loginAttempt = 0;
            await unlockUser.save();
            return res.status(200).json({ message: "User unlocked successfully" })
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ message: error });
        }
    }
};

//refresh token router
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(404).json({ message: "Invalid refresh token " });
    }
    // const findUser = await User.findOne({ email: email });
    //refresh token logic checking here
    // console.log(req.headers)

    // let refreshToken;
    // if (
    //     req.headers.cookie &&
    //     req.headers.cookie.startsWith("refreshToken")
    // )
    //     refreshToken = req.headers.cookie.split("=")[1];
    // console.log(refreshToken)
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const findUser = await User.findById(decoded.id);
    // console.log(findUser)
    if (!findUser)
        return res.status(404).json({ message: "User not found" });
    if (findUser.refreshToken !== refreshToken) { return res.status(404).json({ message: "The  refresh token is invalid" }); }
    else {
        const accessToken = findUser.getSignedAccessToken();
        findUser.accessToken = accessToken;
        await findUser.save();
        return res.status(201).json({ success: true, accessToken });
    }
};

//middleware testing controller 
exports.welcome = async (req, res) => {
    // console.log(req.user);
    res.status(200).send("Welcome 🙌 ");
};

//myinfo
exports.myInfo = async (req, res) => {
    try {
        let userID = req.user._id;
        const userInfo = await User.findOne({ _id: userID }).populate({ path: 'designation', select: 'designation' }).populate({ path: 'reportingPerson', select: 'username' }).select('username employeeID designation dateOfJoining dateOfBirth email phoneNumber personalEmail role reportingPerson avtar')
        return res.status(200).json(userInfo);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Unable to get your Info. Server Error" })
    }

};

//logout router
exports.logout = async (req, res) => {
    const user = req.user;
    // console.log(user);
    try {
        user.accessToken = "";
        user.refreshToken = "";
        await user.save();
        res.status(200).json({ message: "Logged Out Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};

exports.changePassword = async (req, res) => {
    const userId = req.user.id;
    const { password, newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword) return res.status(400).json({ message: "New Password and Confirm Password must be same" });

    if (!(schema.validate(newPassword))) {
        return res
            .status(422)
            .json({ error: "Password must contain at least 8 characters, 2 digits, 1 symbol, 1 uppercase and 1 lowercase letter." });
    }

    try {
        const user = await User.findOne({ _id: userId });
        const passMatch = await user.matchPassword(password);
        if (!passMatch) {
            return res.status(403).send({ message: "Inccorent Password. Please enter your current password" })
        }
        user.password = newPassword;
        await user.save();
        return res.status(200).send({ success: true, message: "Your password was changed successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Unable to change password. Server Error" })
    }
}

//Only available to admins
exports.resetPassword = async (req, res) => {
    const admin = req.user;
    if (admin.role !== "Admin" && admin.role !== "HR") {
        return res.status(403).json({ message: "Only Admins are allowed to access this route and reset password" })
    }
    const { userId, employeeID } = req.body;

    try {
        const user = await User.findOne({ _id: userId, employeeID: employeeID });
        if (!user) return res.status(404).json({ message: "User with this IDs not found" })
        user.password = process.env.RESET_PASSWORD_PHRASE;
        await user.save();
        return res.status(200).send({ success: true, message: "Password has been reset" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Unable to change password. Server Error" })
    }
}

exports.activateDeactivate = async (req, res) => {
    const admin = req.user;
    if (admin.role !== "Admin" && admin.role !== "HR") {
        return res.status(403).json({ message: "Only Admins and HR are allowed to access this route and reset password to activate or deactivate" })
    }
    const { userId, employeeID, flag } = req.body;

    try {
        const user = await User.findOne({ _id: userId, employeeID: employeeID });
        if (!user) return res.status(404).json({ message: "User with this IDs not found" })
        user.isLocked = flag;
        await user.save();
        if (flag)
            return res.status(200).send({ success: true, message: "The User has been deactivated and locked out" });
        else {
            user.loginAttempt = 0;
            await user.save();
            return res.status(200).send({ success: true, message: "The User has been activated and unlocked" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Unable to activate or deactivate employee. Internal Server Error" })
    }
}