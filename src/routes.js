import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import OrderSlipsSummary from './Components/OrderSlips/orderslipssummary';
import KitchenViewSummary from './Components/KitchenView/kitchenView';
import CafeViewSummary from './Components/CafeView/cafeView';
import ReservationsSummary from './Components/ReservationsView/reservationsView';
import HistoryViewSummary from './Components/History/historyView';
import Inventory from './Components/Inventory/inventory';

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/orderslipssummary" element={<OrderSlipsSummary />} />
        <Route path="/kitchenviewsummary" element={<KitchenViewSummary />} />
        <Route path="/cafeviewsummary" element={<CafeViewSummary />} />
        <Route path="/reservationssummary" element={<ReservationsSummary />} />
        <Route path="/historyviewsummary" element={<HistoryViewSummary />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Routing;