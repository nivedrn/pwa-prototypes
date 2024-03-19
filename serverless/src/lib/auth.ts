'use server'

import clientPromise from "../lib/mongodb";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.TOKEN_SECRET ?? "secret";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("3600 sec from now")
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try{
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    }catch(error){
        cookies().delete('session');
        console.log("JWT Decrypt Error : " + error);
        return null;
    }
}

export async function userLogin(email: string, password: string) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_NAME);
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
        cookies().set('session', encryptedSessionData, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60, // One hour
            path: '/',
        });

        return { results: { id: user._id, email: email, name: user.name}, error: null, status: 200 };

    } catch (error) {
        console.log("Login action error: ", error);
        return { results: null, error: "Login action error: " + error, status: 400 };
    }
}

export async function userSignUp(name: string, email: string, password: string) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_NAME);
        const user = await db.collection("users").findOne({ email });
        if (user != null) {
            return { results: null, error: "User with email already exists.", status: 400 };
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT_LENGTH) ?? 10);
        const hashedPassword = await bcrypt.hash(salt + password, salt);

        const result: any = await db.collection("users").insertOne({ name: name, email: email, password: hashedPassword, isVerified: false, isAdmin: false, secret: salt });
        console.log("User Sign Up Result: ", result);
        if (result.acknowledged) {
            const newUser: any = await db.collection("users").findOne({ email });

            const tokenData = {
                name: newUser.name,
                email: newUser.email,
                id: String(newUser._id)
            };


            const encryptedSessionData = await encrypt(tokenData);
            cookies().set('session', encryptedSessionData, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60, // One hour
                path: '/',
            });

            return { results: { id: newUser._id, email: email, name: name}, error: null, status: 200 };
        } else {
            return { results: null, error: "Failed to sign up user.", status: 500 };
        }

    } catch (error) {
        console.log("Sign Up action error: ", error);
        return { results: null, error: "Sign Up action error: " + error, status: 400 };
    }
}

export async function userLogout(){
    cookies().delete('session');
    return { results: "Logout Successfull", error: null, status: 200 };
}

export async function fetchUserSession() {
    const session: any = cookies().get("session")?.value;
    console.log(session);
    if (!session) return null;
    return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return;

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 10 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });
    return res;
}