import Client from '@/models/Clients';
import getQuery from '@/utility/getApiQuery';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-reports-status':
      res = await handleGetAllReports(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-reports':
      res = await handleGetAllReports(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: Request) {
  let res: { data: string | Object | number; status: number };

  switch (getQuery(req).action) {
    case 'get-reports-count':
      res = await handleGetReportsCount(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-clients-onboard':
      res = await handleGetClientsOnboard(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-test-orders-trend':
      res = await handleGetTestOrdersTrend(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-marketers':
      res = await handleGetAllMarketers(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export default async function handle(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      if (req.headers.getallorders) {
        await handleGetAllOrderPaginated(req, res);
      } else if (req.headers.deleteorder) {
        await handleDeleteOrder(req, res);
      } else if (req.headers.getordersbyfilter) {
        await handleGetOrdersByFilter(req, res);
      } else if (req.headers.getordersunfinished) {
        await handleGetOrdersUnFinished(req, res);
      } else if (req.headers.getordersredo) {
        await handleGetOrdersRedo(req, res);
      } else if (req.headers.finishorder) {
        await handleFinishOrder(req, res);
      } else if (req.headers.redoorder) {
        await handleRedoOrder(req, res);
      } else if (req.headers.getordersbyid) {
        await handleGetOrdersById(req, res);
      } else if (req.headers.gettimeperiods) {
        await handleGetTimePeriods(req, res);
      } else if (req.headers.getallordersofclient) {
        await handleGetAllOrdersOfClient(req, res);
      } else if (req.headers.getordersbyfilterstat) {
        await handleGetOrdersByFilterStat(req, res);
      } else if (req.headers.getordersbycountry) {
        await handleGetOrdersByCountry(req, res);
      } else if (req.headers.getordersbymonth) {
        await handleGetOrdersByMonth(req, res);
      } else {
        sendError(res, 400, 'Not a valid GET request');
      }
      break;

    case 'POST':
      if (req.headers.editorder) {
        await handleEditOrder(req, res);
      } else {
        await handleNewOrder(req, res);
      }

      break;

    default:
      sendError(res, 400, 'Unknown request');
  }
}
