import User from "@/db/Users";
import dbConnect from "@/lib/dbConnect";
import { prepareResponse, accessHeaders } from "@/lib/utils"

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'



async function handleSignin(req) {
  try {
    const { name, password } = req.body
    const userData = await User.findOne({
      name: name,
      password: password,
    });

    if (userData) {
      return prepareResponse(200, userData)
    } else {
      return prepareResponse(400, "NO USER FOUND")
    }
  } catch (e) {
    console.error(e)
    return prepareResponse(400, "AN ERROR OCCURED")
  }
}

async function handleNewUser(req) {
  try {
    const data = req.body;
    let insertdata = {
      name: data.name,
      password: data.password,
      role: data.role,
      phone: data.phone,
      email: data.email,
      company_provided_name: data.company_provided_name,
      joining_date: data.joining_date
    };



    const userData = await User.findOneAndUpdate(
      { name: data.name },
      insertdata,
      {
        new: true,
        upsert: true,
      },
    );

    if (userData) {
      return prepareResponse(200, userData);
    } else {
      return prepareResponse(400, "UNABLE TO CREATE ACCOUNT")
    }
  } catch (e) {
    console.error(e)
    return prepareResponse(400, "AN ERROR OCCURED")
  }
}

async function handleGetAllUsers(req) {
  try {
    const usersData = await User.find({});
    return prepareResponse(200, usersData);
  } catch (e) {
    console.error(e)
    return prepareResponse(400, "AN ERROR OCCURED")
  }
}

async function handleGetUserById(req) {
  try {
    let { id } = accessHeaders(req, ["id"])

    const userData = await User.findById(id)

    if (userData) {
      return prepareResponse(200, userData);
    } else {
      return prepareResponse(400, "NO USER FOUND WITH THE ID")
    }
  } catch (e) {
    console.error(e)
    return prepareResponse(400, "AN ERROR OCCURED")
  }
}

async function handleEditUser(req) {
  try {
    const data = req.body;
    const userData = await User.findByIdAndUpdate(data._id, data, {
      new: true,
    });

    if (userData) {
      return prepareResponse(200, userData);
    } else {
      return prepareResponse(400, "NO USER FOUND")
    }
  } catch (e) {
    console.error(e);
    if (e.code === 11000)
      return prepareResponse(400, "AN USER WITH THE NAME ALREADY EXISTS")
    else return prepareResponse(400, "AN ERROR OCCURED")
  }
}

async function handleDeleteUser(req) {
  try {
    let { id } = req.body

    const userData = await User.findByIdAndDelete(id);
    return prepareResponse(200, userData);

  } catch (e) {
    console.error(e);
    return prepareResponse(400, "AN ERROR OCCURED")
  }
}




export async function GET(req, { params }) {

  const reqType = params?.reqType // access the request type from the link /api/user/<reqType>
  dbConnect();
  let res = { status: 500, message: "NO RESPONSE FROM SERVER" }
  let session = null


  switch (reqType) {
    // case "signin":
    //   break;
    // add more request type cases to not check the session for that request type 
    default:
      session = await getServerSession(authOptions)
      if (!session) {
        return new Response('SESSION NOT FOUND', { status: 401 })
      }
  }


  switch (reqType) {
    case "getalluser":
      res = await handleGetAllUsers(req)
      return new Response(res.message, { status: res.status })

    case "getusersbyid":
      res = await handleGetUserById(req)
      return new Response(res.message, { status: res.status })

    default:
      return new Response("UNKNOWN GET REQUEST", { status: 400 })
  }
}


export async function POST(req, { params }) {

  const reqType = params?.reqType // access the request type from the link /api/user/<reqType>
  await dbConnect()
  let res = { status: 500, message: "NO RESPONSE FROM SERVER" }
  let session = null

  switch (reqType) {
    case "signin":
      break;
    // add more request type cases to not check the session for that request type 
    default:
      session = await getServerSession(authOptions)
      if (!session) {
        return new Response('SESSION NOT FOUND', { status: 401 })
      }
  }

  switch (reqType) {
    case "signin":
      res = await handleSignin(req)
      return new Response(res.message, { status: res.status })

    case "newuser":
      res = await handleNewUser(req)
      return new Response(res.message, { status: res.status })

    case "edituser":
      res = await handleEditUser(req)
      return new Response(res.message, { status: res.status })

    case "deleteuser":
      res = await handleDeleteUser(req)
      return new Response(res.message, { status: res.status })
    default:
      return new Response("UNKNOWN POST REQUEST", { status: 400 })
  }
}
