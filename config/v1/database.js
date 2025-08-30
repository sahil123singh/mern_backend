const mongoose = require('mongoose');

const connectDb = async () => {
    try {

        await mongoose.connect('mongodb://localhost:27017/mern_db',
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