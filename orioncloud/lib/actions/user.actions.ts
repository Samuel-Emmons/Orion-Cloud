"use server";
//Create Account Flow
// 1. user enters full name and email
// 2. check if user already exists using the email
// 3. send OTP to user's email
// 4. This will send a secret key for creating a session.
// 5. Return the user's accountId that will be used to complete login.
// 6. Verify OTP and authenticate to login
//OTP means one time password

import {createAdminClient} from "@/lib/appwrite"
import {appwriteConfig} from "@/lib/appwrite/config"
import {Query, ID} from "node-appwrite";
import {parseStringify} from "@/lib/utils"



const getUserByEmail = async (email: string) => {
    const {databases} = await createAdminClient();

    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersTableId,
        [Query.equal("email", [email])],

    );
    return result.total > 0 ? result.documents[0] : null;
}

const handleError = (error: unknown, message: string) =>{
    console.log(error, message);
    throw error;
}

const sendEmailOTP = async ({email}: {email: string}) => {
    const {account} = await createAdminClient();

    try {
        //send otp verification
        const session = await account.createEmailToken(ID.unique(), email)

        return session.userId;
    } catch(error){
        handleError(error, "Failed to send email OTP");
    }
}

export const createAccount = async (
    { fullName, email} : 
    {fullName: string; email: string}) => {
        const existingUser = await getUserByEmail(email);

        const accountId = await sendEmailOTP({email});
        if(!accountId) throw new Error("Failed to send an OTP");

        if(!existingUser){
            const {databases} = await createAdminClient();
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.usersTableId,
                ID.unique(),
                {
                    fullName,
                    email,
                    avatar: 'https://www.svgrepo.com/show/452030/avatar-default.svg',
                    accountId,
                }
            )
        }

        return parseStringify({accountId});
    };
