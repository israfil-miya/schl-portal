import Approval from '@/models/Approvals';
import mongoose from 'mongoose';

export async function handleRejectResponse(data: {
  checked_by: string;
  approval_ids?: string[];
  approval_id?: string;
}): Promise<{ data: string | object; status: number }> {
  try {
    if (
      (!Array.isArray(data.approval_ids) || data.approval_ids.length === 0) &&
      !data.approval_id
    ) {
      return { data: 'No approval ID provided', status: 400 };
    }
    const ids = data.approval_ids?.length
      ? data.approval_ids
      : [data.approval_id!];
    if (!ids.every(id => mongoose.Types.ObjectId.isValid(id)))
      return { data: 'Invalid approval id format', status: 400 };
    if (!mongoose.Types.ObjectId.isValid(data.checked_by))
      return { data: 'Invalid revised by id format', status: 400 };
    const updatedApprovals = await Approval.updateMany(
      { _id: { $in: ids } },
      { status: 'rejected', rev_by: data.checked_by },
    );
    if (updatedApprovals.modifiedCount > 0)
      return { data: updatedApprovals, status: 200 };
    return { data: 'No approvals were updated', status: 400 };
  } catch (e) {
    console.error('Error in handleRejectResponse:', e);
    return { data: 'An error occurred', status: 500 };
  }
}
