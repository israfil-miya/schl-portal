import Navbar from '@/components/navbar/Navbar'
import OrdersTable from "@/components/orders/Orders"


import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'



const getAllOrdersRedo = async () => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/order/getordersredo",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )



  let ordersRedo = await res.json()
  return ordersRedo
}



const getAllOrders = async () => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/order/getallorders",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  let orders = await res.json()
  return orders
}



export default async function Page({ params, searchParams }) {




  let orders = await getAllOrders()
  let ordersRedo = await getAllOrdersRedo()




  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login?callbackUrl=/')
  }


  return (
    <>
      <Navbar navFor="orders" />
      {/* <OrdersTable orders={orders} ordersRedo={ordersRedo} /> */}
    </>
  );
}