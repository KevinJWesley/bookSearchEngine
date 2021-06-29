// import user model
const { User } = require("../models");
// import sign token function from auth
const { signToken } = require("../utils/auth");
const { AuthenticationError } = require("apollo-server-express");

// get a single user by either their id or their username
const resolvers = {
  Query: {
    me: async () => {
      return User.find();
    },

    // me: async (parent, { userId }) => {
    //   return User.findOne({ _id: userId });
    // },
  },

  // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)

  Mutation: {
    addUser: async (parent, { name, email, password }) => {
      const user = await User.create({ name, email, password });
      const token = signToken(user);
      return { token, user };
    },
    // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("No User with this email found");
      }
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect Password!");
      }

      const token = signToken(user);
      return { token, user };
    },

    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)

    saveBook: async (parent, { saveInput, userId }) => {
      return User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { savedBooks: saveInput } },
        { new: true, runValidators: true }
      );
    },
    // remove a book from `savedBooks`

    removeBook: async (parent, { userId, bookId }) => {
      return User.findOneAndUpdate(
        { _id: userId },
        { $pull: { bookId: bookId } },
        { new: true }
      );
    },
  },
};

module.exports = resolvers;
