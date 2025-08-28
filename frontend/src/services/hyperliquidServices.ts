import * as hl from '@nktkas/hyperliquid';
import type { PerpsMetaAndAssetCtxs, PerpsUniverse } from '@nktkas/hyperliquid/types';
import type { ConnectedWallet } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { initializeHyperliquid } from '../lib/hyperliquid';



/**
 * Place an order
 */

export const placeOrder = async (
authenticated: boolean, wallets: ConnectedWallet[], pair: string, isSelected: { buy: boolean; sell: boolean; }, price: string, quantity: string, setStatus: (msg: string) => void, leverage: number) => {
  if (!authenticated || !wallets.length) {
    setStatus('Please log in and connect a wallet');
    return;
  }

  try {
    // Get Ethereum provider and signer
    const ethereumProvider = await wallets[0].getEthereumProvider();
    const ethersProvider = new ethers.BrowserProvider(ethereumProvider);
    const network = await ethersProvider.getNetwork();

    console.log('Network Chain ID:', network.chainId.toString());

    // Ensure user is on HyperEVM testnet (998) or mainnet (999)
    if (network.chainId !== BigInt(998) && network.chainId !== BigInt(999)) {
      setStatus('Wrong network. Switch to HyperEVM Testnet (998) or Mainnet (999).');
      console.error('Wrong network. Chain ID detected:', network.chainId);
      return;
    }

    const signer = await ethersProvider.getSigner();
    const chainIdHex = '0x' + network.chainId.toString(16);

    // Initialize Hyperliquid clients
    const { infoClient, exchClient, agentAddress } = await initializeHyperliquid(signer, chainIdHex);

    // Store agent address for later use
    localStorage.setItem('agentAddress', agentAddress);
    console.log('Agent Wallet Address stored:', agentAddress);

    // Fetch trading metadata & contexts
    const metaAndCtx: PerpsMetaAndAssetCtxs = await infoClient.metaAndAssetCtxs();
    const meta = metaAndCtx[0];
    const ctx = metaAndCtx[1];
    console.log('Universe:', meta.universe.map((u: PerpsUniverse) => u.name));
    console.log('Contexts:', ctx);

    // Find correct coin index for selected pair
    const coinIndex = meta.universe.findIndex((u: PerpsUniverse) => `${u.name}-PERP` === pair);
    console.log('Coin Index for HYPE-PERP:', coinIndex);
    console.log('Selected Leverage:', infoClient.marginTable);

    if (coinIndex === -1) {
      setStatus('Invalid trading pair');
      console.error('Invalid trading pair:', pair);
      return;
    }

    // Check if account exists on Hyperliquid
    const preTransferCheck = await infoClient.preTransferCheck({
      user: await signer.getAddress() as `0x${string}`,
      source: '0x2222222222222222222222222222222222222222',
    });
    console.log('PreTransferCheck:', preTransferCheck);

    if (!preTransferCheck.userExists) {
      setStatus('Hyperliquid account does not exist for this wallet.');
      return;
    }

    // Update leverage
    await exchClient.updateLeverage({
      asset: coinIndex,
      isCross: true,
      leverage,
    });

    // Place the actual order
    const result = await exchClient.order({
      orders: [
        {
          a: coinIndex,
          b: isSelected.buy,
          p: price,
          s: quantity,
          r: false,
          t: { limit: { tif: 'Gtc' } },
        },
      ],
      grouping: 'na',
    });

    const firstStatus = result?.response?.data?.statuses?.[0];
    let txHash: number | undefined;

    if (firstStatus && "resting" in firstStatus) {
      txHash = firstStatus.resting.oid;
    } else if (firstStatus && "filled" in firstStatus) {
      txHash = firstStatus.filled.oid;
    }

    if (txHash) {
      setStatus(`success|https://app.hyperliquid-testnet.xyz/explorer/tx/${txHash}`);
    }
  } catch (error) {
    console.error('Error placing order:', error);
    setStatus('Failed to place order: ' + (error as Error).message);
  }
};


// Fetch mid price for a given coin
export const getMidPrice = async (pair: string): Promise<number | null> => {
  try {
    const transport = new hl.HttpTransport({ isTestnet: true });
    const infoClient = new hl.InfoClient({ transport });

    // allMids returns an object: { [coinSymbol: string]: string }
    const mids = await infoClient.allMids();
    const coin = pair.replace('-PERP', ''); // extract coin symbol

    const midStr = mids[coin];
    if (!midStr) return null;

    const mid = parseFloat(midStr);
    console.log(`Mid price for ${coin}:`, mid);
    return mid;
  } catch (err) {
    console.error("Failed to fetch mid price:", err);
    return null;
  }
};


// Fetch max leverage for a given coin
export const getMaxLeverage = async (pair: string): Promise<number> => {
  try {
    console.log("🔍 Fetching max leverage for:", pair);
    const transport = new hl.HttpTransport({ isTestnet: true });
    const infoClient = new hl.InfoClient({ transport });

    const meta = await infoClient.meta();
    const coinIndex = meta.universe.findIndex(
      (u: PerpsUniverse) => `${u.name}-PERP` === pair
    );
    if (coinIndex === -1) throw new Error(`Coin not found for ${pair}`);

    // Fetch margin table by coin index
    const marginTable = await infoClient.marginTable({ id: coinIndex });
    console.log("Margin Table:", marginTable);
    // irst tier = max leverage
    const firstTier = marginTable.marginTiers[0];
    const maxLev = firstTier.maxLeverage;

    return maxLev;
  } catch (err) {
    console.error("Failed to fetch max leverage:", err);
    return 50;
  }
};
