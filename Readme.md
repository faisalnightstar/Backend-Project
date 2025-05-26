# Backend series of Chai aur Code

This video series focuses on building a backend application using JavaScript.

## Project Overview

This project is a backend application for a video-sharing platform. It includes features such as user authentication, video uploads, subscriptions, and more. Below is a detailed explanation of each file and its purpose.

---

## File Descriptions

### 1. **`/src/index.js`**
- **Purpose**: Entry point of the application. Connects to the database and starts the server.
- **Example**:
    ```javascript
    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        });
    ```

---

### 2. **`/src/app.js`**
- **Purpose**: Configures the Express app with middleware and routes.
- **Key Features**:
    - CORS setup
    - JSON and URL-encoded body parsing
    - Static file serving
    - Cookie parsing
- **Example**:
    ```javascript
    app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
    app.use("/api/v1/users", userRouter);
    ```

---

### 3. **`/src/db/index.js`**
- **Purpose**: Handles MongoDB connection using Mongoose.
- **Example**:
    ```javascript
    const connectionInstance = await mongoose.connect(`${process.env.URI}/${DB_NAME}`);
    console.log(`MongoDB is connected !! DB Host: ${connectionInstance.connection.host}`);
    ```

---

### 4. **`/src/routes/user.routes.js`**
- **Purpose**: Defines routes for user-related operations like registration, login, and profile updates.
- **Example**:
    ```javascript
    router.route("/register").post(upload.fields([...]), registerUser);
    router.route("/login").post(loginUser);
    ```

---

### 5. **`/src/controllers/user.controller.js`**
- **Purpose**: Contains logic for user-related operations such as registration, login, and logout.
- **Example**:
    ```javascript
    const registerUser = asyncHandler(async (req, res) => {
        const { fullName, email, username, password } = req.body;
        // Registration logic...
    });
    ```

---

### 6. **`/src/models/user.model.js`**
- **Purpose**: Defines the Mongoose schema for the `User` model.
- **Key Features**:
    - Password hashing
    - Token generation
- **Example**:
    ```javascript
    userSchema.methods.generateAccessToken = function () {
        return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
    };
    ```

---

### 7. **`/src/models/video.model.js`**
- **Purpose**: Defines the Mongoose schema for the `Video` model.
- **Key Features**:
    - Video metadata (title, description, duration)
    - Cloudinary URLs for video and thumbnail
- **Example**:
    ```javascript
    const videoSchema = new Schema({
        videoFile: { type: String, required: true },
        thumbnail: { type: String, required: true },
        title: { type: String, required: true },
    });
    ```

---

### 8. **`/src/models/subscription.model.js`**
- **Purpose**: Defines the Mongoose schema for the `Subscription` model.
- **Key Features**:
    - Tracks subscribers and channels
- **Example**:
    ```javascript
    const subscriptionSchema = new Schema({
        subscriber: { type: Schema.Types.ObjectId, ref: "User", required: true },
        channel: { type: Schema.Types.ObjectId, ref: "User", required: true },
    });
    ```

---

### 9. **`/src/utils/cloudinary.js`**
- **Purpose**: Handles file uploads to Cloudinary and URL optimizations.
- **Example**:
    ```javascript
    const uploadOnCloudinary = async (localFilePath) => {
        const uploadResult = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        return uploadResult;
    };
    ```

---

### 10. **`/src/utils/asyncHandler.js`**
- **Purpose**: Wraps async route handlers to catch errors and pass them to middleware.
- **Example**:
    ```javascript
    const asyncHandler = (fn) => async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
    ```

---

### 11. **`/src/utils/ApiResponse.js`**
- **Purpose**: Standardizes API responses with a consistent structure.
- **Example**:
    ```javascript
    class ApiResponse {
        constructor(statusCode, data, message = "Success") {
            this.statusCode = statusCode;
            this.data = data;
            this.message = message;
            this.success = statusCode < 400;
        }
    }
    ```

---

### 12. **`/src/utils/ApiError.js`**
- **Purpose**: Custom error class for handling API errors.
- **Example**:
    ```javascript
    class ApiError extends Error {
        constructor(statusCode, message = "Something went wrong") {
            super(message);
            this.statusCode = statusCode;
        }
    }
    ```

---

### 13. **`/src/middlewares/auth.middleware.js`**
- **Purpose**: Verifies JWT tokens for protected routes.
- **Example**:
    ```javascript
    const verifyJWT = asyncHandler(async (req, _, next) => {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = await User.findById(decodedToken?._id).select("-password");
        next();
    });
    ```

---

### 14. **`/src/middlewares/multer.middleware.js`**
- **Purpose**: Configures Multer for file uploads.
- **Example**:
    ```javascript
    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, "./public/temp"),
        filename: (req, file, cb) => cb(null, `${file.originalname}-${Date.now()}`),
    });
    ```

---

### 15. **`/src/constants.js`**
- **Purpose**: Stores constants used across the application.
- **Example**:
    ```javascript
    export const DB_NAME = "videotube";
    ```

---

### 16. **`/public/temp/.gitkeep`**
- **Purpose**: Keeps the `temp` directory in version control.

---

### 17. **`.env.sample`**
- **Purpose**: Provides a template for environment variables.
- **Example**:
    ```plaintext
    URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net
    PORT=8000
    ACCESS_TOKEN_SECRET=your-secret
    ```

---

### 18. **`.prettierrc`**
- **Purpose**: Configures Prettier for code formatting.
- **Example**:
    ```json
    {
        "singleQuote": false,
        "tabWidth": 4
    }
    ```

---

### 19. **`.gitignore`**
- **Purpose**: Specifies files and directories to ignore in Git.
- **Example**:
    ```plaintext
    node_modules/
    .env
    .cache/
    ```

---

## Additional Resources

- [Modal Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)
- [YouTube Link](https://www.youtube.com/watch?v=9B4CvtzXRpc&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=7)
