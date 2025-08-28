import './App.css';
import Header from './components/header';
import OrderForm from './components/order-form';

function App() {
  return (
    <div className="min-h-screen bg-teal-50 text-teal-950">
      <Header />
      <OrderForm />
    </div>
  );
}

export default App;