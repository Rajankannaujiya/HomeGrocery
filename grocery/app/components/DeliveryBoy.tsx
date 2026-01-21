
import { deliveredOrders } from '../actions/order'
import DeliveryBoyDashboard from './DeliveryBoyDashboard'


async function DeliveryBoy() {

  const orders = await deliveredOrders();

  if(!orders){
    return;
  }

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o)=>new Date(o.deliveredAt!).toDateString() === today).length;
  const todayEarning = todayOrders*40

  return (
    <>
    <DeliveryBoyDashboard earning = {todayEarning}/>
    </>
  )
}

export default DeliveryBoy