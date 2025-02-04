import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import { subscribe } from "diagnostics_channel";
import mongoose from "mongoose";

// const generateAccessTokenAndRefreshToken = async (userId) => {
//     try {
//         const user = await User.findById(userId);
//         if (!user) {
//             throw new ApiError(404, "User not found");
//         }
//         //generating token
//         const accessToken = user.generateAccessToken();
//         if (!accessToken) {
//             throw new ApiError(
//                 500,
//                 "Something went wrong while generating access token"
//             );
//         }
//         const refreshToken = user.generateRefreshToken();
//         if (!refreshToken) {
//             throw new ApiError(
//                 500,
//                 "Something went wrong while generating refresh token"
//             );
//         }
//         // saving refresh token in db
//         user.refreshToken = refreshToken;
//         await user.save({ validateBeforeSave: false });

//         //returning token from this methode
//         return { accessToken, refreshToken };
//     } catch (error) {
//         throw new ApiError(
//             500,
//             "Something went wrong while generating refresh and access token"
//         );
//     }
// };

//USER SIGNUP CONTROLLER

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        if (!accessToken) {
            console.error("Access token generation failed for user:", userId); // Log with user ID!
            throw new ApiError(500, "Failed to generate access token");
        }

        const refreshToken = user.generateRefreshToken();
        if (!refreshToken) {
            console.error("Refresh token generation failed for user:", userId); // Log with user ID!
            throw new ApiError(500, "Failed to generate refresh token");
        }

        user.refreshToken = refreshToken;
        try {
            await user.save({ validateBeforeSave: false }); // Consider removing this if possible
        } catch (dbError) {
            console.error("Error saving refresh token to database:", dbError);
            throw new ApiError(500, "Failed to save refresh token"); // More specific message
        }

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error in generateAccessTokenAndRefreshToken:", error); // Crucial!
        throw new ApiError(500, "Something went wrong while generating tokens"); // Keep a general message
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validate user details - not empty, valid email, password length
    // check if user already exists in the database: username, email
    // if user already exists, send error message
    // check for images, check for avatar
    //upload image to cloudinary, get image url
    // create user object - create user in the database
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, email, username, password } = req.body;
    //console.log(fullName, email, username, password);

    // validate user details - not empty, valid email, password length
    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All field are required.");
    }

    // check if user already exists in the database: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        // **Crucial: Delete files from local storage if user exists**
        if (req.files?.avatar && req.files.avatar[0].path) {
            try {
                fs.unlinkSync(req.files.avatar[0].path);
                console.log(`Deleted avatar from: ${req.files.avatar[0].path}`); // Log for debugging
            } catch (err) {
                console.error(`Error deleting avatar: ${err}`); // Handle deletion errors
            }
        }
        if (req.files?.coverImage && req.files.coverImage[0].path) {
            try {
                fs.unlinkSync(req.files.coverImage[0].path);
                console.log(
                    `Deleted cover image from: ${req.files.coverImage[0].path}`
                );
            } catch (err) {
                console.error(`Error deleting cover image: ${err}`);
            }
        }
        throw new ApiError(409, "User with username or email already exist");
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0].path;
    //const coverImageLocalPath = req.files?.coverImage[0].path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required to upload on LocalPath");
    }

    //upload image to cloudinary, get image url
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar is required to upload on cloudinary");
    }

    // create user object - create user in the database
    const user = await User.create({
        // create is methode and it takes object
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // we not checking coverimage is upload successfully or not that why if (coverImage?) is present then take url. if not, then take empty string.
        email,
        password,
        username: username.toLowerCase(),
    });

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" // select methode me jo jo nhi chahiye response me usko - sign laga kr likh do. jaise user.model me likha waise hi
    );
    // now, checking user created or not
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    // returning res
    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

// LOGIN USER CONTROLLER
const loginUser = asyncHandler(async (req, res) => {
    // get data from req body which is frontend
    // check user is sending  username or email
    // check username or email present in db. if not, throw err
    // if yes, validate the user (check password). if incorrect throw err
    // if correct generate the accessToken and refreshToken
    // send through cookies

    // getting data from req body which is frontend
    const { email, username, password } = req.body;

    // check user is sending  username or email
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required");
    }

    // check username or email present in db. if not, throw err
    const user = await User.findOne({
        $or: [{ email }, { username }], //$or is m_db's operators. which is finding based on email or username is present in db, or not
    });

    //if user is not exist in db then throwing err
    if (!user) {
        throw new ApiError(401, "User does not register");
    }

    //if user exist, then checking password is correct or not through isPasswordCorrect() method (user.model.js)
    const isPasswordValid = await user.isPasswordCorrect(password);
    // password is incorrect then throw err
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    //if password is correct then generating tokens using methods(generateAccessTokenAndRefreshToken)
    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id);

    // removing password and refreshToken before sending through cookies
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    //now securing the token before sending through cookies
    const options = {
        httpOnly: true,
        secure: true,
        // now cookies can be modify from frontend, its only modifiable through server
    };
    //sending cookie
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in Successfully"
            )
        );
});

//Logout user
// const logoutUser = asyncHandler(async (req, res) => {
//     if (!req.user) {
//         // Important: Check if req.user exists
//         throw new ApiError(401, "Unauthorized request. User not found."); // Or handle differently
//     }

//     // remove refresh token from db
//     await User.findById(
//         req.user._id,
//         { $set: { refreshToken: "" } },
//         { new: true }
//     );

//     const options = {
//         httpOnly: true,
//         secure: true,
//     };
//     return res
//         .status(200)
//         .clearCookie("accessToken", options)
//         .clearCookie("refreshToken", options)
//         .json(new ApiResponse(200, {}, "User logged out successfully"));
// });

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                req.user.fullName,
                "User logged Out Successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const IncomingRefreshToken = req.cookies.refreshToken;

    if (!IncomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            IncomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        if (!decodedToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        if (user.refreshToken !== IncomingRefreshToken) {
            throw new ApiError(
                401,
                "Refresh token mismatch this means expired or used"
            );
        }

        const { accessToken, refreshToken } =
            await generateAccessTokenAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, {}, "Access token refreshed successfully")
            );
    } catch (error) {
        console.error("Error in refreshAccessToken:", error);
        throw new ApiError(
            400,
            error?.message || "Failed to refresh access token"
        );
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword /*confirmNewPassword */ } = req.body;
    /*
    if new password and confirm new password is available then

    // if((newPassword !== confirmNewPassword)){
    //     throw new ApiError(400, "New password and confirm password must be same");
    // }
    */
    const user = await User.findById(req.user._id);

    if (!user) {
        console.error("User not found");
        throw new ApiError(404, "User not found for changing password");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    if (oldPassword === newPassword) {
        throw new ApiError(
            400,
            "New password cannot be same as current password"
        );
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current User found"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, username } = req.body;

    if (!fullName || !email || !username) {
        throw new ApiError(
            400,
            "All field are required to update account details."
        );
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
                username,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required to be file uploaded");
    }

    const avatar = uploadOnCloudinary(avatarLocalPath.url);

    if (!avatar.url) {
        throw new ApiError(400, "Something went wrong while uploading avatar");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalFilePath = req.file?.path;

    if (!coverImageLocalFilePath) {
        throw new ApiError(
            400,
            "CoverImage file is required to be file uploaded"
        );
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalFilePath);

    if (!coverImage.url) {
        throw new ApiError(
            400,
            "Something went wrong while uploading coverImage"
        );
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "coverImage updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(
            400,
            "Username is required to get userChannel profile"
        );
    }
    const channel = User.aggregate([
        {
            $match: username?.toLowerCase(),
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscriber",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscribeCount: { $size: "$subscriber" },
                channelSubscribedToCount: { $size: "$subscribedTo" },
            },
            isSubscribed: {
                $cond: {
                    if: { $in: [req.user?._id, "$subscriber._id"] },
                    then: true,
                    else: false,
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscribeCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                createdAt: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found or does not exist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "Channel profile fetched successfully"
            )
        );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId.createFromHexString(
                    req.user._id
                ),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner", // owner of the video
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: "$owner",
                        },
                    },
                ],
            },
        },
    ]);

    if (!user?.length) {
        throw new ApiError(404, "User not found in watchHistory");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
