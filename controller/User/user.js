const { Types } = require('mongoose');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existUser = await User.aggregate([
      [
        {
          $match: {
            _id: Types.ObjectId.createFromHexString(id),
          },
        },
        {
          $project: {
            email: 1,
            name: 1,
            bio: 1,
            photo: 1,
            public: 1,
            phone: 1,
          },
        },
      ],
    ]);
    if (!existUser.length) {
      const error = new Error('User not found');
      error.status = 422;
      throw error;
    }

    res.status(200).json({ message: 'User Fetched', user: existUser[0] });
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};

exports.getPublicUsers = async (req, res, next) => {
  try {
    const { userId } = req;

    const existUser = await User.aggregate([
      [
        {
          $match: {
            public: true,
            _id: { $ne: Types.ObjectId.createFromHexString(userId) },
          },
        },
        {
          $project: {
            email: 1,
            name: 1,
            bio: 1,
            photo: 1,
          },
        },
      ],
    ]);
    if (!existUser.length) {
      const error = new Error('User not found');
      error.status = 422;
      throw error;
    }

    res.status(200).json({ message: 'Public Users Fetched', user: existUser });
  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, photo, bio, phone } = req.body;

    if(phone.length != 10){
        const error = new Error('Enter Valid Phone Number');
        error.status = 422;
        throw error;
    }
    
    const existUser = await User.findById(id);

    if (!existUser) {
        const error = new Error('User not found');
        error.status = 422;
        throw error;
    }

    existUser.name = name;
    existUser.email = email;
    existUser.bio = bio;
    existUser.phone = phone;
    existUser.photo = photo;

    const updatedUser = await existUser.save();

    if (!updatedUser) {
        const error = new Error('User not updated');
        error.status = 422;
        throw error;
    }

    res.status(200).json({message: "User Updated", user: updatedUser});

  } catch (err) {
    if (!err.status) {
      err.status = 500;
    }
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, pass } = req.body;

        const existUser = await User.findOne({ email: email });
  
        if (!existUser) {
          const error = new Error('User not found');
          error.status = 422;
          throw error;
        }

        const hashedPass = await bcrypt.hash(pass, 12);

        if (!hashedPass) {
            const error = new Error('Password Error');
            error.status = 422;
            throw error;
          }
  
        existUser.password = hashedPass;
  
        const updatedUser = await existUser.save();
  
        if (!updatedUser) {
          const error = new Error('Upassword not resetted');
          error.status = 422;
          throw error;
        }
  
        res.status(200).json({message: "Password Reset Succesfully"});
  
    } catch (err) {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    }
  };