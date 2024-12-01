import Approval from '@/db/Approvals';
import Client from '@/db/Clients';
import Employee from '@/db/Employees';
import Order from '@/db/Orders';
import Report from '@/db/Reports';
import User from '@/db/Users';
import dbConnect from '@/db/dbConnect';
import NextCors from 'nextjs-cors';
dbConnect();
function sendError(res, statusCode, message) {
  res.status(statusCode).json({
    error: true,
    message: message,
  });
}

async function handleNewReq(req, res) {
  const data = req.body;
  console.log('data: ', data);

  try {
    const resData = await Approval.create(data);

    if (resData) {
      console.log(resData);
      res.status(200).json(resData);
    } else {
      sendError(res, 400, 'Unable to handle response');
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

async function handleResponse(req, res) {
  const data = req.body;

  console.log('THE DATA ON HANDLE RESPONSE: ', data);

  if (data.response == 'reject') {
    const resData = await Approval.findByIdAndUpdate(data._id, {
      checked_by: data.checked_by,
      is_rejected: true,
    });

    if (resData) {
      console.log(resData);
      res.status(200).json(resData);
    } else {
      sendError(res, 400, 'Unable to handle response');
    }
  }

  if (data.response == 'approve') {
    if (data.req_type == 'User Delete') {
      const resData = await User.findByIdAndDelete(data.id);
      const updateApprovaL = await Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );

      if (resData) {
        console.log(resData);
        res.status(200).json(updateApprovaL);
      } else {
        sendError(res, 400, 'Unable to handle response');
      }
    }

    if (data.req_type == 'User Create') {
      let insertdata = {
        real_name: data.real_name,
        name: data.name,
        password: data.password,
        role: data.role,
      };

      const resData = await User.findOneAndUpdate(
        { name: data.name },
        insertdata,
        {
          new: true,
          upsert: true,
        },
      );

      const updateApprovaL = await Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );

      if (resData) {
        console.log(resData);
        res.status(200).json(updateApprovaL);
      } else {
        sendError(res, 400, 'Unable to handle response');
      }
    }

    if (data.req_type == 'Task Delete') {
      const resData = await Order.findByIdAndDelete(data.id);

      const updateApprovaL = await Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );

      if (resData) {
        console.log(resData);
        res.status(200).json(updateApprovaL);
      } else {
        sendError(res, 400, 'Unable to handle response');
      }
    }

    if (data.req_type == 'Client Delete') {
      const resData = await Client.findByIdAndDelete(data.id);
      const updateApprovaL = await Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );

      if (resData) {
        console.log(resData);
        res.status(200).json(updateApprovaL);
      } else {
        sendError(res, 400, 'Unable to handle response');
      }
    }
    if (data.req_type == 'Report Delete') {
      const resData = await Report.findByIdAndDelete(data.id);
      const updateApprovaL = await Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );

      if (resData) {
        console.log(resData);
        res.status(200).json(updateApprovaL);
      } else {
        sendError(res, 400, 'Unable to handle response');
      }
    }
    if (data.req_type == 'Employee Delete') {
      const resData = await Employee.findByIdAndDelete(data.id);
      const updateApprovaL = await Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );

      if (resData) {
        console.log(resData);
        res.status(200).json(updateApprovaL);
      } else {
        sendError(res, 400, 'Unable to handle response');
      }
    }
    if (data.req_type == 'Report Edit') {
      let editData = { ...data };
      delete editData.id;
      delete editData.req_by;
      delete editData.req_type;
      delete editData._id;

      const resData = await Report.findByIdAndUpdate(data.id, editData, {
        new: true,
      });

      const updateApprovaL = await Approval.findByIdAndUpdate(
        data._id,
        {
          checked_by: data.checked_by,
          is_rejected: false,
        },
        { new: true },
      );

      if (resData) {
        console.log(resData);
        res.status(200).json(updateApprovaL);
      } else {
        sendError(res, 400, 'Unable to handle response');
      }
    }
  }
}

async function handleGetAllApprovals(req, res) {
  try {
    const page = req.headers.page || 1;

    let {
      request_by,
      request_type,
      approved_check,
      rejected_check,
      waiting_check,
    } = req.headers;

    const ITEMS_PER_PAGE = parseInt(req.headers.item_per_page) || 30;

    let query = {};
    if (request_by) query.req_by = { $regex: request_by, $options: 'i' };
    if (request_type) query.req_type = { $regex: request_type, $options: 'i' };

    approved_check = approved_check === 'true';
    rejected_check = rejected_check === 'true';
    waiting_check = waiting_check === 'true';

    if (approved_check) {
      query.is_rejected = { $eq: false };
      query.checked_by = { $ne: 'None' };
    }
    if (rejected_check) {
      query.is_rejected = { $eq: true };
      query.checked_by = { $ne: 'None' };
    }
    if (waiting_check) {
      query.checked_by = { $eq: 'None' };
    }

    console.log(query);

    if (
      Object.keys(query).length === 0 &&
      query.constructor === Object &&
      req.headers.isfilter == 'true'
    )
      sendError(res, 400, 'No filter applied');
    else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      const count = await Approval.countDocuments(query);

      let applovals;

      if (req.headers.notpaginated) applovals = await Approval.find({});
      else
        applovals = await Approval.find(query)
          .sort({
            updatedAt: -1,
          })
          .skip(skip)
          .limit(ITEMS_PER_PAGE)
          .exec();

      const processedAppprovals = applovals.map(approvalReq => {
        let priority = 0;

        switch (true) {
          case approvalReq.checked_by === 'None':
            priority = 1;
            break;
          default:
            priority = 2;
            break;
        }

        return {
          ...approvalReq.toObject(),
          priority,
        };
      });
      const sortedApprovals = processedAppprovals.sort(
        (a, b) => a.priority - b.priority,
      );

      const pageCount = Math.ceil(count / ITEMS_PER_PAGE); // Calculate the total number of pages

      res.status(200).json({
        pagination: {
          count,
          pageCount,
        },
        items: sortedApprovals,
      });
    }
  } catch (e) {
    console.error(e);
    sendError(res, 500, 'An error occurred');
  }
}

async function handleResponseMultiple(req, res) {
  const bodyData = req.body;

  console.log('THE DATA ON HANDLE RESPONSE: ', bodyData);

  if (bodyData.response === 'reject') {
    if (bodyData.approval_ids.length === 0) {
      console.log('No approval IDs provided');
      sendError(res, 400, 'No approval IDs provided');
      return;
    }

    const updatedApprovals = await Approval.updateMany(
      { _id: { $in: bodyData.approval_ids } },
      {
        checked_by: bodyData.checked_by,
        is_rejected: true,
      },
    ).lean();

    if (updatedApprovals && updatedApprovals.modifiedCount > 0) {
      console.log(updatedApprovals);
      res.status(200).json(updatedApprovals);
    } else {
      console.log(updatedApprovals);
      sendError(res, 400, 'Unable to handle response');
    }
  }

  if (bodyData.response === 'approve') {
    if (bodyData.approval_ids.length === 0) {
      console.log('No approval IDs provided');
      sendError(res, 400, 'No approval IDs provided');
      return;
    }

    const approvalPromises = [];

    for (const approval_ID of bodyData.approval_ids) {
      const data = await Approval.findById(approval_ID).lean();

      if (data.req_type === 'User Delete') {
        const resData = await User.findByIdAndDelete(data.id);
        const updateApproval = await Approval.findByIdAndUpdate(
          data._id,
          {
            checked_by: bodyData.checked_by,
            is_rejected: false,
          },
          { new: true },
        );

        if (resData) {
          console.log(resData);
          approvalPromises.push(updateApproval);
        } else {
          sendError(res, 400, 'Unable to handle response');
        }
      }

      if (data.req_type === 'User Create') {
        const insertData = {
          real_name: data.real_name,
          name: data.name,
          password: data.password,
          role: data.role,
        };

        const resData = await User.findOneAndUpdate(
          { name: data.name },
          insertData,
          {
            new: true,
            upsert: true,
          },
        );

        const updateApproval = await Approval.findByIdAndUpdate(
          data._id,
          {
            checked_by: bodyData.checked_by,
            is_rejected: false,
          },
          { new: true },
        );

        if (resData) {
          console.log(resData);
          approvalPromises.push(updateApproval);
        } else {
          sendError(res, 400, 'Unable to handle response');
        }
      }

      if (data.req_type == 'Task Delete') {
        const resData = await Order.findByIdAndDelete(data.id);

        const updateApproval = await Approval.findByIdAndUpdate(
          data._id,
          {
            checked_by: bodyData.checked_by,
            is_rejected: false,
          },
          { new: true },
        );

        if (resData) {
          console.log(resData);
          approvalPromises.push(updateApproval);
        } else {
          sendError(res, 400, 'Unable to handle response');
        }
      }

      if (data.req_type == 'Client Delete') {
        const resData = await Client.findByIdAndDelete(data.id);
        const updateApproval = await Approval.findByIdAndUpdate(
          data._id,
          {
            checked_by: bodyData.checked_by,
            is_rejected: false,
          },
          { new: true },
        );

        if (resData) {
          console.log(resData);
          approvalPromises.push(updateApproval);
        } else {
          sendError(res, 400, 'Unable to handle response');
        }
      }

      if (data.req_type == 'Report Delete') {
        const resData = await Report.findByIdAndDelete(data.id);
        const updateApproval = await Approval.findByIdAndUpdate(
          data._id,
          {
            checked_by: bodyData.checked_by,
            is_rejected: false,
          },
          { new: true },
        );

        if (resData) {
          console.log(resData);
          approvalPromises.push(updateApproval);
        } else {
          sendError(res, 400, 'Unable to handle response');
        }
      }

      if (data.req_type == 'Employee Delete') {
        const resData = await Employee.findByIdAndDelete(data.id);
        const updateApproval = await Approval.findByIdAndUpdate(
          data._id,
          {
            checked_by: bodyData.checked_by,
            is_rejected: false,
          },
          { new: true },
        );

        if (resData) {
          console.log(resData);
          approvalPromises.push(updateApproval);
        } else {
          sendError(res, 400, 'Unable to handle response');
        }
      }

      if (data.req_type == 'Report Edit') {
        let editData = { ...data };
        delete editData.id;
        delete editData.req_by;
        delete editData.req_type;
        delete editData._id;

        const resData = await Report.findByIdAndUpdate(data.id, editData, {
          new: true,
        });

        const updateApproval = await Approval.findByIdAndUpdate(
          data._id,
          {
            checked_by: bodyData.checked_by,
            is_rejected: false,
          },
          { new: true },
        );

        console.log('UPDATE APPROVAL LIST: ', updateApproval);

        if (resData) {
          console.log(resData);
          approvalPromises.push(updateApproval);
        } else {
          sendError(res, 400, 'Unable to handle response');
        }
      }
    }

    try {
      const results = await Promise.all(approvalPromises);
      res.status(200).json(results);
    } catch (error) {
      console.error('Error processing approvals:', error);
      sendError(res, 500, 'Internal Server Error');
    }
  }
}

export default async function handle(req, res) {
  const { method } = req;

  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'POST'],
    origin: '*', // You can specify the allowed origin(s) here
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  switch (method) {
    case 'GET':
      if (req.headers.getallapprovals) {
        await handleGetAllApprovals(req, res);
      } else {
        sendError(res, 400, 'Not a valid GET request');
      }
      break;

    case 'POST':
      if (req.body.response) {
        if (req.headers.multiple) {
          await handleResponseMultiple(req, res);
        } else {
          await handleResponse(req, res);
        }
      } else await handleNewReq(req, res);

      break;

    default:
      sendError(res, 400, 'Unknown request');
  }
}
