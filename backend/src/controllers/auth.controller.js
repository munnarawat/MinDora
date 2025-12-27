const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

async function registerController(req, res) {
  const {
    fullName: { firstName, lastName },
    email,
    password,
  } = req.body;

  const isUserAlreadyExists = await userModel.findOne({ email });

  if (isUserAlreadyExists) {
    return res.status(400).json({ message: "User Already Exists" });
  }
  const hashPassword = await bcryptjs.hash(password, 10);
  const user = await userModel.create({
    email: email,
    fullName: {
      firstName,
      lastName,
    },
    password: hashPassword,
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
  res.cookie("token", token);

  res.status(201).json({
    message: "User successfully Created ",
    user: {
      email: user.email,
      id: user._id,
      fullName: user.fullName,
    },
  });
}
async function loginController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email,
  });
  if(!user){
    return res.status(400).json({message:"Invailid email"})
  }
  const isPasswordValid = await bcryptjs.compare(password, user.password);

  if(!isPasswordValid){
    return res.status(400).json({message:"Password is Wrong, please Enter right password"})
  }

  const token = jwt.sign({id:user._id},process.env.JWT_SECRET_KEY);
  res.cookie("token",token)
  res.status(200).json({
    message:"User LogIn successfully",
    user,
  })
}

async function GetUserInfo(req,res) {
   try {
     if (!req.user) {
       return res.status(404).json({ message: "User not found",user });
     }
     res.status(200).json({
       message: "User information retrieved successfully",
       user: {
         email: req.user.email,
         id: req.user._id,
         fullName: req.user.fullName,
       },
     });
   } catch (error) {
     console.log( "note reciveing user info", error);
     
   }

}
async function LogOutController(req,res) {
  try {
    const { token} = req.cookies;

    if(!token){
      return res.status(200).json({message:" Already logged out"})
    }
     const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
     }
     res.clearCookie("token", cookieOptions);
     res.status(200).json({
      success: true,
      message:"Logged Out successfully"
    })
  } catch (error) {
    console.error("Error during logout:", error); 
    res.status(500).json({
      success: false,
      message: "Server error, please try again later."
    });
  }
}
module.exports = {
  registerController,
  loginController,
  GetUserInfo,
  LogOutController,
};
