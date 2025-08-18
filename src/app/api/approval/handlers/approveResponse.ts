import Approval from '@/models/Approvals';
import Client from '@/models/Clients';
import Employee from '@/models/Employees';
import Order from '@/models/Orders';
import Report from '@/models/Reports';
import Schedule from '@/models/Schedule';
import User from '@/models/Users';
import mongoose from 'mongoose';

export async function handleApproveResponse(data: {
  checked_by: string;
  approval_ids?: string[];
  approval_id?: string;
}): Promise<{ data: string | object; status: number }> {
  try {
    if (
      (!Array.isArray(data.approval_ids) || data.approval_ids.length === 0) &&
      !data.approval_id
    )
      return { data: 'No approval ID provided', status: 400 };
    const ids = data.approval_ids?.length
      ? data.approval_ids
      : [data.approval_id!];
    if (!ids.every(id => mongoose.Types.ObjectId.isValid(id)))
      return { data: 'Invalid approval id format', status: 400 };
    if (!mongoose.Types.ObjectId.isValid(data.checked_by))
      return { data: 'Invalid revised by id format', status: 400 };
    const results = await Promise.allSettled(
      ids.map(async approval_ID => {
        const approvalData = await Approval.findById(approval_ID).lean();
        if (!approvalData)
          throw new Error(`Approval request not found for ID: ${approval_ID}`);
        let resData;
        switch (approvalData.target_model) {
          case 'User':
            if (approvalData.action === 'create')
              resData = await User.create(approvalData.new_data);
            else if (approvalData.action === 'delete')
              resData = await User.findByIdAndDelete(approvalData.object_id);
            break;
          case 'Order':
            if (approvalData.action === 'delete')
              resData = await Order.findByIdAndDelete(approvalData.object_id);
            break;
          case 'Client':
            if (approvalData.action === 'delete')
              resData = await Client.findByIdAndDelete(approvalData.object_id);
            break;
          case 'Schedule':
            if (approvalData.action === 'delete')
              resData = await Schedule.findByIdAndDelete(
                approvalData.object_id,
              );
            break;
          case 'Report':
            if (approvalData.action === 'delete')
              resData = await Report.findByIdAndDelete(approvalData.object_id);
            else if (approvalData.action === 'update')
              resData = await Report.findByIdAndUpdate(
                approvalData.object_id,
                approvalData.changes?.reduce<Record<string, any>>(
                  (acc, change) => {
                    acc[change.field] = change.newValue;
                    return acc;
                  },
                  {},
                ),
                { new: true },
              );
            break;
          case 'Employee':
            if (approvalData.action === 'delete')
              resData = await Employee.findByIdAndDelete(
                approvalData.object_id,
              );
            break;
          default:
            throw new Error(
              `Unsupported request type: ${approvalData.target_model} ${approvalData.action}`,
            );
        }
        if (!resData)
          return {
            data: `Failed to process ${approvalData.target_model} ${approvalData.action}`,
            status: 400,
          };
        const updatedApproval = await Approval.findByIdAndUpdate(
          approval_ID,
          { status: 'approved', rev_by: data.checked_by },
          { new: true },
        );
        return updatedApproval;
      }),
    );
    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value);
    const errors = results.filter(
      r =>
        r.status === 'rejected' ||
        (r.status === 'fulfilled' &&
          (r as any).value &&
          'error' in (r as any).value),
    );
    if (successful.length === 0)
      return {
        data: errors.map(e =>
          e.status === 'fulfilled' ? (e as any).value : (e as any).reason,
        ),
        status: 400,
      };
    return {
      data: {
        successful,
        errors: errors.map(e =>
          e.status === 'fulfilled' ? (e as any).value : (e as any).reason,
        ),
      },
      status: errors.length ? 207 : 200,
    };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
