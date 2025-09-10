import { NextRequest } from 'next/server';
import { handleApproveResponse } from './approveResponse';
import { handleRejectResponse } from './rejectResponse';

export async function handleSingleResponse(
  req: NextRequest,
): Promise<{ data: string | object; status: number }> {
  try {
    const {
      _id,
      response,
      rev_by,
    }: { _id: string; response: 'reject' | 'approve'; rev_by: string } =
      await req.json();
    if (!response || !rev_by || !_id)
      return { data: 'Invalid body data', status: 400 };
    if (response === 'reject')
      return handleRejectResponse({ checked_by: rev_by, approval_id: _id });
    if (response === 'approve')
      return handleApproveResponse({ checked_by: rev_by, approval_id: _id });
    return { data: 'Invalid response type', status: 400 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
