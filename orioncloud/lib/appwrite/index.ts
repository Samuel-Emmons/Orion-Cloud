//this code essentially allows our next.js server to actually talk to appwrite, making a session for things to be changed.
//The flow is: user signs in, server sets a cookie containing the session's secret, the browser then stores it and inclues it in all later requests to Orion Cloud

"user server"
import {appwriteConfig} from "@/lib/appwrite/config"
import {cookies} from "next/headers"
import {Account, Client, Databases, Avatars, Storage} from "node-appwrite"

export const createSessionClient = async () => {
    const client = new Client()
        .setEndpoint(appwriteConfig.endpointUrl)
        .setProject(appwriteConfig.projectId);

    //server reads it
    const session = (await cookies()).get('appwrite-session')

    if(!session || !session.value) throw new Error('No session')

    //server passes secret to appwrite
    client.setSession(session.value)

    return {
        get account(){
            return new Account(client);
        },
        get databases()
        {
            return new Databases(client);
        }
    }
};

export const createAdminClient = async () => {
    const client = new Client()
        .setEndpoint(appwriteConfig.endpointUrl)
        .setProject(appwriteConfig.projectId)
        .setKey(appwriteConfig.secretKey);


    return {
        get account()
        {
            return new Account(client);
        },
        get databases()
        {
            return new Databases(client);
        },
        get storage()
        {
            return new Storage(client);
        },
        get avatars()
        {
            return new Avatars(client);
        }
    }
}

export default createSessionClient;