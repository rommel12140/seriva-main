import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import OrderSlipsSummary from './Components/OrderSlips/orderslipssummary';

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/orderslipssummary" element={<OrderSlipsSummary />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Routing;