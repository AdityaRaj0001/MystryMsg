import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";


export const authOptions:NextAuthOptions={
    providers:[
        CredentialsProvider({
            id:"Credentials",
            name:"Credentials",
            credentials:{
                email:{label:"Email",type:"text"},
                password:{lablel:"Password",type:"password"}
            },
            async authorize(credentials:any):Promise<any> {
                await dbConnect()
                try {
                    const user = await userModel.findOne({
                        $or:[
                            {email:credentials.identifier},
                            {username:credentials.identifier}
                        ]
                    })

                    if(!user){
                        throw new Error('No user found with this email')
                    }

                    if(!user.isVerified){
                        throw new Error('Please verify your account before login')
                    }

                    const isPasswordCorrect= await bcrypt.compare(credentials.password,user.password)
                    if (!isPasswordCorrect) {
                        throw new Error('Password doesnot match')
                    } else {
                        return user
                    }
                } catch (err:any) {
                    throw new Error(err)
                }
            }
        })
    ],
    pages:{
        signIn:'/sign-in'
    },
    session:{
        strategy:"jwt"
    },
    secret:process.env.NEXTAUTH_SECRET
}