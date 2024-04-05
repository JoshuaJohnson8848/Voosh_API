const { Types } = require('mongoose');
const User = require('../../models/user');

exports.getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);
    const existUser = await User.aggregate([
      [
        {
          $match: {
            _id:  Types.ObjectId.createFromHexString(id),
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
