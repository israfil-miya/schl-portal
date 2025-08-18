import { NextRequest } from 'next/server';
import { handleApproveResponse } from './approveResponse';
import { handleRejectResponse } from './rejectResponse';

export async function handleMultipleResponse(
  req: NextRequest,
): Promise<{ data: string | object; status: number }> {
  try {
    const {
      _ids,
      response,
      rev_by,
    }: { _ids: string[]; response: 'reject' | 'approve'; rev_by: string } =
      await req.json();
    if (
      !response ||
      !rev_by ||
      !_ids ||
      !Array.isArray(_ids) ||
      _ids.length === 0
    )
      return { data: 'Invalid body data', status: 400 };
    if (response === 'reject')
      return handleRejectResponse({ checked_by: rev_by, approval_ids: _ids });
    if (response === 'approve')
      return handleApproveResponse({ checked_by: rev_by, approval_ids: _ids });
    return { data: 'Invalid response type', status: 400 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}
