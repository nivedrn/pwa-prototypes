'use server'
import { cookies } from "next/headers";

export async function userLogout(){
    cookies().delete('session');
    return { results: "Logout Successfull", error: null, status: 200 };
}

export async function userCreateSession(encryptedSessionData: string){
    cookies().set('session', encryptedSessionData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // One hour
        path: '/',
    });
}

export async function fetchUserSession() {
    const session: any = cookies().get("session")?.value;
    console.log(session);
    if (!session) return null;
    return session;
}

