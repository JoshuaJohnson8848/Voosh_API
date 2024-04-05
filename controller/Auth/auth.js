const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  try {
    const { email, pass, name, phone, bio } = req.body;
    const existUser = await User.findOne({ email: email });

    if (existUser) {
      const error = new Error('User Already Exist');
      error.status = 422;
      throw error;
    }
    
    if(phone.length != 10){
      const error = new Error('Enter Valid Phone Number');
      error.status = 422;
      throw error;
    }

    const existPhone = await User.findOne({ phone: phone });

    if (existPhone) {
      const error = new Error('Phone Number Already Exist');
      error.status = 422;
      throw error;
    }

    const hashedPass = await bcrypt.hash(pass, 12);

    if (!hashedPass) {
      const error = new Error('Password Error');
      error.status = 422;
      throw error;
    }

    const user = await new User({
      email: email,
      phone: phone,
      bio: bio,
      password: hashedPass,
      name: name,
      photo: '',
    });

    const createdUser = await user.save();

    if (!createdUser) {
      const error = new Error('User Signup Failed');
      error.status = 422;
      throw error;
    }

    res.status(200).json({ message: 'Succesfully Signed Up', createdUser });
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    let loadedUser;
    const { email, pass } = req.body;
    const existUser = await User.aggregate([
      [
        {
          $match:
            {
              email: email,
            },
        },
        {
          $lookup: {
            from: "userTypes",
            localField: "userType",
            foreignField: "_id",
            as: "userTypeData",
          },
        },
        {
          $unwind:
            {
              path: "$userTypeData",
            },
        },
        {
          $project:
            {
              email: 1,
              userType: "$userTypeData.userType",
              password: 1
            },
        },
      ]
    ]);

    if (!existUser.length) {
      const error = new Error('User not found');
      error.status = 422;
      throw error;
    }
    loadedUser = existUser[0];
    
    const hashedPass = await bcrypt.compare(pass, loadedUser.password);
    
    if (!hashedPass) {
      const error = new Error('Password Error');
      error.status = 422;
      throw error;
    }
    
    const token = JWT.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
      );
      
    res
      .status(200)
      .json({
        message: 'Succesfully Logged In',
        token: token,
        userType: loadedUser.userType,
      });
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};

