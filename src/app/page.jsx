import UseOrders from "../components/orders/Order";
import Navbar from "@/components/navbar/Navbar";
import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {headers} from "next/headers"

import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getAllOrdersRedo = async () => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/order/getordersredo",
    {
      method: "GET",
      headers: headers(),
    }
  );

  if (!res.ok) {
    throw new Error("FAILED TO FETCH DATA");
  }

  return res.json();
};

const getAllOrdersUnfinished = async () => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/order/getordersunfinished",
    {
      method: "GET",
      headers: headers(),
    }
  );

  if (!res.ok) {
    throw new Error("FAILED TO FETCH DATA");
  }

  return res.json();
};

export default async function Page({ params, searchParams }) {
  const session = await getServerSession(authOptions);
  let ordersUnfinished = await getAllOrdersUnfinished();
  let ordersRedo = await getAllOrdersRedo();

  // const { orders, countdowns } = <UseOrders initialOrders={ordersUnfinished} />;
  return (
    <>
      <Navbar navFor={"orders"} session={session} />
      HELLO {session?.user?.name}
    </>
  );

  // return (
  //   <>
  //     <div className="mb-5">
  //       <div className="overflow-x-auto my-2">
  //         <h5 className="text-center py-4">Test & Correction</h5>
  //         <Table className="py-3">
  //           <TableHeader>
  //             <TableRow>
  //               <TableHead>Client Code</TableHead>
  //               <TableHead>Folder</TableHead>
  //               <TableHead>Quantity</TableHead>
  //               <TableHead>Download Date</TableHead>
  //               <TableHead>Delivery Time</TableHead>
  //               <TableHead>Task</TableHead>
  //               <TableHead>E.T.</TableHead>
  //               <TableHead>Production</TableHead>
  //               <TableHead>QC1</TableHead>
  //               <TableHead>Comments</TableHead>
  //               <TableHead>Type</TableHead>
  //               <TableHead>Status</TableHead>
  //             </TableRow>
  //           </TableHeader>
  //           <TableBody>
  //             {ordersRedo &&
  //               ordersRedo.map((order, index) => {
  //                 return (
  //                   <TableRow key={order._id}>
  //                     <TableCell>{index + 1}</TableCell>
  //                     <TableCell className="break-normal">
  //                       {order.client_code}
  //                     </TableCell>
  //                     <TableCell className="break-normal">{order.folder}</TableCell>
  //                     <TableCell className="break-normal">
  //                       {order.quantity}
  //                     </TableCell>
  //                     <TableCell className="break-normal">
  //                       {order.download_date}
  //                     </TableCell>
  //                     <TableCell className="break-normal">
  //                       {order.delivery_date}
  //                       <span className="text-body-secondary"> | </span>
  //                       {order.delivery_bd_time}
  //                     </TableCell>
  //                     <TableCell className="break-normal">{order.task}</TableCell>
  //                     <TableCell className="break-normal">{order.et}</TableCell>
  //                     <TableCell className="break-normal">
  //                       {order.production}
  //                     </TableCell>
  //                     <TableCell className="break-normal">{order.qc1}</TableCell>
  //                     <TableCell className="break-normal">{order.comment}</TableCell>
  //                     <TableCell className="break-normal">{order.type}</TableCell>
  //                     <TableCell className="break-normal">{order.status}</TableCell>
  //                   </TableRow>
  //                 );
  //               })}
  //           </TableBody>
  //         </Table>
  //       </div >

  //       <div className="overflow-x-auto my-2">
  //         <h5 className="text-center py-4">Running Task List</h5>
  //         <Table className="py-3">
  //           <TableHead>
  //             <TableRow>
  //               <TableHeader>#</TableHeader>
  //               <TableHeader>Client Code</TableHeader>
  //               <TableHeader>Folder</TableHeader>
  //               <TableHeader>Quantity</TableHeader>
  //               <TableHeader>Download Date</TableHeader>
  //               <TableHeader>Delivery Time</TableHeader>
  //               <TableHeader>Time Remaining</TableHeader>
  //               <TableHeader>Task</TableHeader>
  //               <TableHeader>E.T.</TableHeader>
  //               <TableHeader>Production</TableHeader>
  //               <TableHeader>QC1</TableHeader>
  //               <TableHeader>Comments</TableHeader>
  //               <TableHeader>Type</TableHeader>
  //               <TableHeader>Status</TableHeader>
  //             </TableRow>
  //           </TableHead>
  //           <TableBody>
  //             {orders &&
  //               orders?.map((order, index) => {
  //                 let priorityColor = "";
  //                 const countdownTime = countdowns[index];
  //                 const [hours, minutes, seconds] = countdownTime.split(":");
  //                 const totalSeconds =
  //                   parseInt(hours) * 3600 +
  //                   parseInt(minutes) * 60 +
  //                   parseInt(seconds);

  //                 if (totalSeconds > 0) {
  //                   if (totalSeconds <= 1800) {
  //                     priorityColor = "table-danger";
  //                   } else if (totalSeconds <= 3600) {
  //                     priorityColor = "table-warning";
  //                   }
  //                 }
  //                 if (countdownTime == "Over") priorityColor = "table-dark";

  //                 return (
  //                   <TableRow
  //                     key={order._id}
  //                     className={priorityColor ? priorityColor : ""}
  //                   >
  //                     <TableCell>{index + 1}</TableCell>
  //                     <TableCell className="break-normal">
  //                       {order.client_code}
  //                     </TableCell>
  //                     <TableCell className="break-normal">{order.folder}</TableCell>
  //                     <TableCell className="break-normal">
  //                       {order.quantity}
  //                     </TableCell>
  //                     <TableCell className="break-normal">
  //                       {order.download_date}
  //                     </TableCell>
  //                     <TableCell className="break-normal">
  //                       {order.delivery_date}
  //                       <span className="text-body-secondary"> | </span>
  //                       {order.delivery_bd_time}
  //                     </TableCell>
  //                     <TableCell className="break-normal">
  //                       {countdowns[index]}
  //                     </TableCell>
  //                     <TableCell className="break-normal">{order.task}</TableCell>
  //                     <TableCell className="break-normal">{order.et}</TableCell>
  //                     <TableCell className="break-normal">
  //                       {order.production}
  //                     </TableCell>
  //                     <TableCell className="break-normal">{order.qc1}</TableCell>
  //                     <TableCell className="break-normal">{order.comment}</TableCell>
  //                     <TableCell className="break-normal">{order.type}</TableCell>
  //                     <TableCell className="break-normal">{order.status}</TableCell>
  //                   </TableRow>
  //                 );
  //               })}
  //           </TableBody>
  //         </Table>
  //       </div>
  //     </div >
  //   </>
  // );
}
