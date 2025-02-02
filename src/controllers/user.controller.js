import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    console.log(fullName, email, username, password);

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
        throw new ApiError(409, "User with username or email already exist");
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0].path;
    const coverImageLocalPath = req.files?.coverImage[0].path;

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

export { registerUser };
