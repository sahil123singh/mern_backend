require('dotenv').config();

const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        console.log('url======>>', process.env.MONGO_URL)
// mongodb://localhost:27017/mern_db
        await mongoose.connect(process.env.MONGO_URL,
            {
                // useNewUrlParser: true,
                // useUnifiedTopology: true
            }
        )
        console.log("✅ database Connected...");

    } catch (error) {
        console.error("❌ Error connecting to database:", error.message);
        process.exit(1); // stop server if DB fails


    }
}

module.exports = connectDb