import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            minlength: 3,
            maxlength: 100,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // cloudinary URL
            required: true,
        },
        coverImage: {
            type: String, // cloudinary URL
        },
        watchHistory: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        password: {
            type: String,
            required: [true, "Password is required"],

            // Password must contain at least one lowercase letter, one uppercase letter, one number, one special character, and be between 8-15 characters
            minlength: [8, "Password must be at least 8 characters"],
            maxlength: [15, "Password cannot exceed 15 characters"],
            validate: [
                {
                    validator: function (password) {
                        return /^(?=.*[a-z])/.test(password);
                    },
                    message:
                        "Password must contain at least one lowercase letter",
                },
                {
                    validator: function (password) {
                        return /^(?=.*[A-Z])/.test(password);
                    },
                    message:
                        "Password must contain at least one uppercase letter",
                },
                {
                    validator: function (password) {
                        return /^(?=.*\d)/.test(password);
                    },
                    message: "Password must contain at least one number",
                },
                {
                    validator: function (password) {
                        return /^(?=.*[@$!%*?&])/.test(password);
                    },
                    message:
                        "Password must contain at least one special character (@$!%*?&)",
                },
                {
                    validator: function (password) {
                        return /^[A-Za-z\d@$!%*?&]{8,15}$/.test(password);
                    },
                    message:
                        "Password can only contain letters, numbers, and special characters (@$!%*?&)",
                },
            ],
        },

        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", userSchema);
