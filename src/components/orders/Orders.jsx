"use client"

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"



export default function Orders({ orders, ordersRedo }) {

  const getCurrentTimes = (orders) => {
    console.log(orders);
    const timesNow = orders?.map((order) =>
      order.timeDifference <= 0
        ? "Over"
        : calculateCountdown(order.timeDifference)
    );
    return timesNow;
  };

  function calculateCountdown(timeDifferenceMs) {
    const totalSeconds = Math.floor(timeDifferenceMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  const [countdowns, setCountdowns] = useState(getCurrentTimes(orders));

  const getAllOrdersTime = () => {
    return fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/order/gettimeremainingfororders",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());
  };
  
  useEffect(() => {
    if (orders?.length) {
      const countdownIntervalId = setInterval(() => {
        getAllOrdersTime()
          .then((updatedOrders) => {
            const updatedCountdowns = getCurrentTimes(updatedOrders);
            setCountdowns(updatedCountdowns);
          })
          .catch((e) => {
            console.error(e)
            toast.error("COULDN'T UPDATE TIME REMAINING:")
          });
      }, process.env.NEXT_PUBLIC_UPDATE_DELAY);
  
      return () => {
        clearInterval(countdownIntervalId); // Clear countdown interval
      };
    }
  }, [orders]);

  return (
    <>
      <div className="mb-5">
        <div className="overflow-x-auto my-2">
          <h5 className="text-center py-4">Test & Correction</h5>
          <Table className="py-3">
            <TableHead>
              <TableRow>
                <TableHeader>#</TableHeader>
                <TableHeader>Client Code</TableHeader>
                <TableHeader>Folder</TableHeader>
                <TableHeader>Quantity</TableHeader>
                <TableHeader>Download Date</TableHeader>
                <TableHeader>Delivery Time</TableHeader>
                <TableHeader>Task</TableHeader>
                <TableHeader>E.T.</TableHeader>
                <TableHeader>Production</TableHeader>
                <TableHeader>QC1</TableHeader>
                <TableHeader>Comments</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordersRedo &&
                ordersRedo.map((order, index) => {
                  return (
                    <TableRow key={order._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="break-normal">
                        {order.client_code}
                      </TableCell>
                      <TableCell className="break-normal">{order.folder}</TableCell>
                      <TableCell className="break-normal">
                        {order.quantity}
                      </TableCell>
                      <TableCell className="break-normal">
                        {order.download_date}
                      </TableCell>
                      <TableCell className="break-normal">
                        {order.delivery_date}
                        <span className="text-body-secondary"> | </span>
                        {order.delivery_bd_time}
                      </TableCell>
                      <TableCell className="break-normal">{order.task}</TableCell>
                      <TableCell className="break-normal">{order.et}</TableCell>
                      <TableCell className="break-normal">
                        {order.production}
                      </TableCell>
                      <TableCell className="break-normal">{order.qc1}</TableCell>
                      <TableCell className="break-normal">{order.comment}</TableCell>
                      <TableCell className="break-normal">{order.type}</TableCell>
                      <TableCell className="break-normal">{order.status}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        <div className="overflow-x-auto my-2">
          <h5 className="text-center py-4">Running Task List</h5>
          <Table className="py-3">
            <TableHead>
              <TableRow>
                <TableHeader>#</TableHeader>
                <TableHeader>Client Code</TableHeader>
                <TableHeader>Folder</TableHeader>
                <TableHeader>Quantity</TableHeader>
                <TableHeader>Download Date</TableHeader>
                <TableHeader>Delivery Time</TableHeader>
                <TableHeader>Time Remaining</TableHeader>
                <TableHeader>Task</TableHeader>
                <TableHeader>E.T.</TableHeader>
                <TableHeader>Production</TableHeader>
                <TableHeader>QC1</TableHeader>
                <TableHeader>Comments</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders &&
                orders?.map((order, index) => {
                  let priorityColor = "";
                  const countdownTime = countdowns[index];
                  const [hours, minutes, seconds] = countdownTime.split(":");
                  const totalSeconds =
                    parseInt(hours) * 3600 +
                    parseInt(minutes) * 60 +
                    parseInt(seconds);

                  if (totalSeconds > 0) {
                    if (totalSeconds <= 1800) {
                      priorityColor = "table-danger";
                    } else if (totalSeconds <= 3600) {
                      priorityColor = "table-warning";
                    }
                  }
                  if (countdownTime == "Over") priorityColor = "table-dark";

                  return (
                    <TableRow
                      key={order._id}
                      className={priorityColor ? priorityColor : ""}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="break-normal">
                        {order.client_code}
                      </TableCell>
                      <TableCell className="break-normal">{order.folder}</TableCell>
                      <TableCell className="break-normal">
                        {order.quantity}
                      </TableCell>
                      <TableCell className="break-normal">
                        {order.download_date}
                      </TableCell>
                      <TableCell className="break-normal">
                        {order.delivery_date}
                        <span className="text-body-secondary"> | </span>
                        {order.delivery_bd_time}
                      </TableCell>
                      <TableCell className="break-normal">
                        {countdowns[index]}
                      </TableCell>
                      <TableCell className="break-normal">{order.task}</TableCell>
                      <TableCell className="break-normal">{order.et}</TableCell>
                      <TableCell className="break-normal">
                        {order.production}
                      </TableCell>
                      <TableCell className="break-normal">{order.qc1}</TableCell>
                      <TableCell className="break-normal">{order.comment}</TableCell>
                      <TableCell className="break-normal">{order.type}</TableCell>
                      <TableCell className="break-normal">{order.status}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}