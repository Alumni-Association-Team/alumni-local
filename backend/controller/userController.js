import User from "../model/User/userInfo.js";
import SkillInfo from "../model/User/skillInfo.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/createToken.js";
// const nodemailer = require("nodemailer");
import nodemailer from "nodemailer";
import JobInfo from "../model/User/jobInfo.js";
import ExtraInfo from "../model/User/extraInfo.js";

async function sendVerificationEmail(email, code) {
  console.log(email, code);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "alumniteam95@gmail.com",
      pass: "jdde essm exwg pptw",
    },
  });

  // const transporter = nodemailer.createTransport({
  //   host: 'smtp.ethereal.email',
  //   port: 587,
  //   auth: {
  //       user: 'jayden.ritchie62@ethereal.email',
  //       pass: 'RCRpx4kU4TZ59V438C'
  //   }
  // });

  let mailOptions = {
    // from: 'alumniteam95@gmail.com',
    from: "Alumni Association <alumniteam95@gmail.com>",
    to: email,
    subject: "Your OTP Code",
    html: `
          <div style="font-family: Arial, sans-serif; text-align: center;">
              <h2>OTP Verification</h2>
              <p>Your One-Time Password (OTP) for verification is:</p>
              <div style="font-size: 24px; font-weight: bold; color: #007BFF; margin: 15px 0;
                          padding: 10px 20px; border: 2px dashed #007BFF; display: inline-block;">
                  ${code}
              </div>
              <p>This OTP is valid for 1 hour. Do not share it with anyone.</p>
          </div>
      `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

const createUser = async (req, res) => {
  const { rollNumber, fullName, email, password, role, gender, batch } =
    req.body;
  if (!rollNumber || !fullName || !email || !password || !gender || !batch) {
    return res.status(400).json({ message: "All inputs are required." });
  }

  // Checking the user exist or not
  const checkUserExists = await User.findOne({ email });
  console.log("Existing User:", checkUserExists);

  if (checkUserExists) {
    return res.status(409).send("User already exists.");
  }

  // Hashing password....
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  // Creating a new User ...
  const newUser = new User({
    rollNumber,
    fullName,
    email,
    password: hashPassword,
    role,
    gender,
    batch,
  });

  newUser.verifyCode = Math.floor(Math.random() * 9000 + 1000);
  newUser.codeExpiry = new Date(Date.now() + 3600000);

  try {
    const savedUser = await newUser.save();

    await sendVerificationEmail(savedUser.email, savedUser.verifyCode);
    // generating token
    await generateToken(res, savedUser._id);
    return res.status(201).json({
      _id: savedUser._id,
      rollNumber: savedUser.rollNumber,
      fullName: savedUser.fullName,
      email: savedUser.email,
      role: savedUser.role,
      gender: savedUser.gender,
      batch: savedUser.batch,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    // Find the user by roll number
    const findUser = await User.findOne({ rollNumber });

    // If user is not found
    if (!findUser) {
      return res.status(404).json({ message: "User not found..." });
    }

    // Compare entered password with hashed password
    const passwordValidation = await bcrypt.compare(
      password,
      findUser.password
    );

    if (!passwordValidation) {
      return res.status(401).json({ message: "Invalid password..." });
    }

    // Generate token and return user data
    generateToken(res, findUser._id);
    return res.status(200).json({
      rollNumber: findUser.rollNumber,
      fullName: findUser.fullName,
      email: findUser.email,
      role: findUser.role,
      gender: findUser.gender,
      batch: findUser.batch,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true, // Ensures client-side JS cannot access it
    // secure: process.env.NODE_ENV === 'production', // Ensures it's only cleared over HTTPS in production
    sameSite: "strict",
  });
  res.status(200).json({ message: "logout successfully..." });
};

const getUserProfile = async (req, res) => {
  const id = await req.user._id;
  if (!id) {
    return res.status(401).json({ message: "not login..." });
  }
  try {
    const user = await User.findById(id);
    return res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.rollNumber = req.body.rollNumber || user.rollNumber;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        user.password = hashPassword;
      }
    }
    return res.status(201).json(user);
  } catch (error) {
    console.log("error : ", error.message);
  }
};

const addUserSkills = async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(402).json({ message: "userId not found.." });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(402).json({ message: "user not found.." });
  }
  const existingSkill = await SkillInfo.findOne({ userId });
  if (existingSkill) {
    return res
      .status(403)
      .json({ message: "you can only update the skill...." });
  }
  const { technicalSkill, nonTechnicalSkill } = req.body;
  try {
    const newSkills = new SkillInfo({
      userId,
      technicalSkill,
      nonTechnicalSkill,
    });

    const savedSkills = await newSkills.save();

    const user = await User.findByIdAndUpdate(
      userId,
      { skillId: savedSkills._id },
      { new: true }
    );

    return res.status(202).json({
      user,
      savedSkills,
    });

    // return res.status(202).json({
    //   message: "new skills added..",
    //   technicalSkill: savedSkills.technicalSkill,
    //   nonTechnicalSkill: savedSkills.nonTechnicalSkill,
    // });
  } catch (error) {
    console.log(error);
    res.status(502).json({ message: "error in saving skills.." });
  }
};

const updateUserSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(402).json({ message: "please login..." });
    }
    const skills = await SkillInfo.findOne({ userId });
    if (!skills) {
      return res.status(403).json({ message: "skill not founded..." });
    }
    if (req.body.technicalSkill && Array.isArray(req.body.technicalSkill)) {
      skills.technicalSkill.push(...req.body.technicalSkill);
    }
    if (skills.nonTechnicalSkill && Array.isArray(req.body.nonTechnicalSkill)) {
      skills.nonTechnicalSkill.push(...req.body.nonTechnicalSkill);
    }
    await skills.save();
    return res
      .status(202)
      .json({ message: "skill added successfully", skills });
  } catch (err) {
    console.log(err.message);
    return res.status(403).json({ message: "server error..." });
  }
};

const addUserJobInfo = async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(402).json({ message: "userId not found.." });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(402).json({ message: "user not found.." });
  }
  const existingJobId = await JobInfo.findOne({ userId });
  if (existingJobId) {
    return res
      .status(403)
      .json({ message: "you can only update the job info...." });
  }
  const { companyName, position, duration, location, previousCompany } =
    req.body;
  if (previousCompany && !Array.isArray(previousCompany)) {
    return res.status(403).json({ message: "provide an array..." });
  }
  try {
    const newJobInfo = new JobInfo({
      userId,
      companyName,
      position,
      duration,
      location,
      previousCompany,
    });
    const saveJobInfo = await newJobInfo.save();
    const user = await User.findByIdAndUpdate(
      userId,
      { jobId: saveJobInfo._id },
      { new: true, upsert: true }
    );
    return res.status(202).json({
      saveJobInfo,
    });
  } catch (e) {
    console.log(e);
    return res.status(502).json({ message: "error in saving jobDtails.." });
  }
};

const updateJobInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(402).json({ message: "please login..." });
    }
    const job = await JobInfo.findOne({ userId });
    if (!job) {
      return res.status(403).json({ message: "jobinfo not founded..." });
    }
    const previous = {
      companyName: job.companyName,
      position: job.position,
      duration: job.duration,
    };
    job.previousCompany.push(previous);

    const { companyName, position, duration, location } = req.body;
    if (companyName) {
      job.companyName = companyName;
    }
    if (position) {
      job.position = position;
    }
    if (duration) {
      job.duration = duration;
    }
    if (location) {
      job.location = location;
    }
    await job.save();
    return res.status(202).json({ message: "jobInfo added successfully", job });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: "server error..." });
  }
};

const addExtraInfo = async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(402).json({ message: "userId not found.." });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(402).json({ message: "user not found.." });
  }
  const extraInfo = await ExtraInfo.findOne({ userId });
  const { achievements, extracurriculars } = req.body;
  if (!extraInfo) {
    try {
      const newExtraInfo = new ExtraInfo({
        userId,
        achievements,
        extracurriculars,
      });

      const saveExtraInfo = await newExtraInfo.save();
      const user = await User.findByIdAndUpdate(
        userId,
        { extraId: saveExtraInfo._id },
        { new: true, upsert: true }
      );
      return res.status(202).json({
        saveExtraInfo,
      });
    } catch (error) {
      console.log(error);
      return res.status(502).json({ message: "some server error occure..." });
    }
  } else {
    try {
      if (achievements && Array.isArray(achievements)) {
        extraInfo.achievements.push(...achievements);
      }
      if (extracurriculars && Array.isArray(extracurriculars)) {
        extraInfo.extracurriculars.push(...extracurriculars);
      }
      extraInfo.save();
      return res
        .status(202)
        .json({ message: "ExtraInfo added successfully", extraInfo });
    } catch (error) {
      console.log(error);
      return res.status(502).json({ message: "server error occure..." });
    }
  }
};

const verifyCode = async (req, res) => {
  const { code } = req.body;
  const { email } = req.params;

  try {
    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(404).json({ message: "User not found..." });
    }

    const foundUserVerifyCode = foundUser.verifyCode;
    const foundUserexpiry = foundUser.codeExpiry;

    const isnotExpired = foundUserexpiry > Date.now();

    const codeVerification = code == foundUserVerifyCode;

    if (codeVerification && isnotExpired) {
      foundUser.isVerified = true;
      await foundUser.save();
      return res.status(200).json({ message: "User verified successfully." });
    } else {
      if (!isnotExpired) {
        return res.status(400).json({ message: "Code Expired" });
      } else {
        return res.status(400).json({ message: "Incorrect Verification Code" });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: "could not run verify-code" });
  }
};

const getProfile = async (req, res) => {
  const rollNumber = req.params.rollNumber;
  try {
    const user = await User.find({ rollNumber: rollNumber }).populate([
      "extraId",
      "analyticsId",
      "jobId",
      "skillId",
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export {
  createUser,
  loginUser,
  getUserProfile,
  logoutUser,
  updateUserInfo,
  verifyCode,
  updateUserSkills,
  addUserSkills,
  getProfile,
  addUserJobInfo,
  updateJobInfo,
  addExtraInfo,
};
