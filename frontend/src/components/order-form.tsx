import PriceChart from '@/components/price-chart';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { getMidPrice, placeOrder } from '../services/hyperliquidServices';
import LeverageSlider from './leverage-slider';
import StatusMessage from './status-messages';

const OrderForm = () => {
  const [pair, setPair] = useState('HYPE-PERP');
  const [isSelected, setIsSelected] = useState({ buy: false, sell: false });
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  // Fetch current mid price
  useEffect(() => {
    const fetchMidPrice = async () => {
      const mid = await getMidPrice(pair);
      if (mid) setCurrentPrice(mid);
    };

    fetchMidPrice();
    const interval = setInterval(fetchMidPrice, 10_000); // optional refresh every 10s
    return () => clearInterval(interval);
  }, [pair]);
  
  // TODO: Fix leverage range
  // Fetch and set max leverage for selected pair
/*   useEffect(() => {
    const fetchLimits = async
 */


  return (
    <>
      <h2 className="text-center text-2xl font-light text-teal-600">Place Order</h2>
      <div className="max-w-md mx-auto bg-white p-6 border border-teal-500 rounded-lg shadow mt-6">

        {/* Trading Pair */}
        <div className="mb-4">
          <label htmlFor="pair-selection" className="block mb-2 text-emerald-950">Trading Pair</label>
          <select
            id="pair-selection"
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="w-full p-2 border border-teal-500 rounded text-black"
          >
            <option value="HYPE-PERP">HYPE-PERP</option>
            <option value="BTC-PERP" disabled>BTC-PERP</option>
            <option value="SOL-PERP" disabled>SOL-PERP</option>
          </select>
        </div>

        {/* Price chart */}
        <PriceChart pair={pair} />

        {/* Buy / Sell buttons */}
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setIsSelected({ buy: true, sell: false })}
            className={`flex-1 p-2 border border-transparent rounded hover:border hover:border-teal-950 ${isSelected.buy ? 'bg-teal-600 text-white hover:border-white' : 'bg-emerald-200 text-teal-950'}`}
          >
            Buy
          </button>
          <button
            onClick={() => setIsSelected({ buy: false, sell: true })}
            className={`flex-1 p-2 border border-transparent rounded hover:border hover:border-teal-950 ${isSelected.sell ? 'bg-teal-600 text-white hover:border-white' : 'bg-emerald-200 text-teal-950'}`}
          >
            Sell
          </button>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label htmlFor="quantity-input" className="block mb-2">Quantity</label>
          <input
            id="quantity-input"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 border border-teal-500 rounded text-black"
            placeholder="e.g., 1 HYPE"
            min="0.01"
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label htmlFor="price-input" className="block mb-2">Limit Price</label>
          <input
            id="price-input"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border border-teal-500 rounded text-black"
            placeholder={currentPrice ? `Current ≈ ${currentPrice}` : "e.g., 0.02 USDC"}
            min={currentPrice ? (currentPrice * 0.5).toFixed(4) : "0.0001"}
          />
        </div>

        {/* LeverageSlider */}
        <LeverageSlider leverage={leverage} onChange={setLeverage} />

        {/* Action button */}
        <button
          onClick={() =>
            placeOrder(authenticated, wallets, pair, isSelected, price, quantity, setStatus, leverage)
          }
          className="border border-transparent w-full bg-teal-600 text-white p-2 rounded shadow-md hover:border-teal-950 hover:shadow-lg"
          disabled={!authenticated || Number(price) <= 0 || Number(quantity) <= 0}
        >
          Place Order
        </button>

        {/* StatusMessage */}
        <StatusMessage status={status} />
      </div>
    </>
  );
};

export default OrderForm;
