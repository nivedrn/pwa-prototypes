
const { connectToDatabase } = require("../data/mongodb.js");
const bcrypt = require("bcryptjs");
const { SignJWT, jwtVerify } = require("jose");
require("dotenv").config();

const secretKey = process.env.TOKEN_SECRET ?? "secret";
const key = new TextEncoder().encode(secretKey);

async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("3600 sec from now")
        .sign(key);
}

async function decrypt(input) {
    try{
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    }catch(error){
        console.log("JWT Decrypt Error : " + error);
        return null;
    }
}

async function userLogin(email, password) {
    try {
        const db = await connectToDatabase();
        const user = await db.collection("users").findOne({ email });
        if (!user) {
            return { results: null, error: "User not found.", status: 400 };
        }

        const validPassword = await bcrypt.compare(user.secret + password, user.password );
        if (!validPassword) {
            return { error: "Invalid credentials.", status: 400 };
        }

        const tokenData = {
            name: user.name,
            email: user.email,
            id: String(user._id)
        }

        const encryptedSessionData = await encrypt(tokenData);
        return { results: { id: user._id, email: email, name: user.name, session: encryptedSessionData}, error: null, status: 200 };

    } catch (error) {
        console.log("Login action error: ", error);
        return { results: null, error: "Login action error: " + error, status: 400 };
    }
}

async function userSignUp(name, email, password) {
    try {
        const db = await connectToDatabase();
        const user = await db.collection("users").findOne({ email });
        if (user != null) {
            return { results: null, error: "User with email already exists.", status: 400 };
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT_LENGTH) ?? 10);
        const hashedPassword = await bcrypt.hash(salt + password, salt);

        const result = await db.collection("users").insertOne({ name: name, email: email, password: hashedPassword, isVerified: false, isAdmin: false, secret: salt });
        console.log("User Sign Up Result: ", result);
        if (result.acknowledged) {
            const newUser = await db.collection("users").findOne({ email });

            const tokenData = {
                name: newUser.name,
                email: newUser.email,
                id: String(newUser._id)
            };

            const encryptedSessionData = await encrypt(tokenData);
            return { results: { id: newUser._id, email: email, name: name, session: encryptedSessionData}, error: null, status: 200 };
        } else {
            return { results: null, error: "Failed to sign up user.", status: 500 };
        }

    } catch (error) {
        console.log("Sign Up action error: ", error);
        return { results: null, error: "Sign Up action error: " + error, status: 400 };
    }
}

module.exports = { userLogin, userSignUp };