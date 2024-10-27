import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, password, email } = await request.json();
    const existingUserVerifiedByUsername = await userModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEmail = await userModel.findOne({ email });
    const verifyCode=Math.floor(100000 + Math.random()*900000).toString()

    if (existingUserByEmail) {
      if(existingUserByEmail.isVerified){
        return Response.json({
          success:false,
          message:"email already registered with another User, please try any other email"
        },{status:400})
      }
      else {
        const newhashedPassword=await bcrypt.hash(password,10)
        existingUserByEmail.password=newhashedPassword
        existingUserByEmail.verifyCode=verifyCode
        existingUserByEmail.verifyCodeExpiry=new Date(Date.now() + 3600000)
        await existingUserByEmail.save()
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate= new Date()
      expiryDate.setHours(expiryDate.getHours()+1)

      const newUser= new userModel({
        username,
        email,
        password:hashedPassword,  
        verifyCode,
        verifyCodeExpiry:expiryDate,
        isAcceptingMessage:true,
        isVerified:false,
        messages:[],
      })

      await newUser.save()
    }

    //send verification email

    const emailServiceResponse= await sendVerificationEmail(email,username,verifyCode)

    if(!emailServiceResponse.success){
      return Response.json({
        success:false,
        message:emailServiceResponse.message
      },{status:500})
    }

    return Response.json({
      success:true,
      message:"User registed successfully, Please verify your email"
    },{status:201})

   
  } catch (error) {
    console.error("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
