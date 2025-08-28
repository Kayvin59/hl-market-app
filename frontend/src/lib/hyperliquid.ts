import * as hl from "@nktkas/hyperliquid";
import { ethers } from "ethers";

/**
 * Initialize Hyperliquid clients and create an Agent Wallet.
 * Also funds the Agent Wallet so it is usable, with a self-activation fallback.
 */
export const initializeHyperliquid = async (
  signer: ethers.Signer,
  chainIdHex: string
) => {
  // Transport & InfoClient
  const transport = new hl.HttpTransport({ isTestnet: true });
  const infoClient = new hl.InfoClient({ transport });

  // Generate new Agent Wallet dynamically
  const agentWallet = ethers.Wallet.createRandom();
  const agentAddress = agentWallet.address as `0x${string}`;
  const agentPrivateKey = agentWallet.privateKey;

  // Initialize ExchangeClient with Agent Wallet
  const exchClient = new hl.ExchangeClient({
    wallet: agentWallet,
    transport,
    isTestnet: true,
    signatureChainId: chainIdHex as `0x${string}`,
  });
  console.log("Initialized ExchangeClient with Agent Wallet:", agentAddress, "chainIdHex:", chainIdHex);

  // Initialize a client bound to the master/user signer (to approve + fund)
  const userExchClient = new hl.ExchangeClient({
    wallet: signer,
    transport,
    isTestnet: true,
    signatureChainId: chainIdHex as `0x${string}`,
  });

  // Approve Agent Wallet using master signer
  const masterAddress = await signer.getAddress();
  console.log("Approving Agent Wallet:", agentAddress, "with Master:", masterAddress);
  const approveAgentResponse = await userExchClient.approveAgent({
    agentAddress: agentAddress,
    agentName: "Agent1",
  });
  console.log("Approve Agent Response:", approveAgentResponse);

  // Transfer 10 USD from master to Agent Wallet using usdSend
  const fundResponse = await userExchClient.usdSend({
    destination: agentAddress,
    amount: "10",
  });
  console.log("usdSend (master -> agent) Response:", fundResponse);

  // Wait for deposit to be recognized with extended polling
  let preTransferCheck: Awaited<ReturnType<typeof infoClient.preTransferCheck>>;
  for (let i = 0; i < 20; i++) { // Try up to 20 times (100 seconds total)
    preTransferCheck = await infoClient.preTransferCheck({
      user: agentAddress,
      source: "0x2222222222222222222222222222222222222222",
    });
    console.log("PreTransferCheck attempt", i + 1, ":", preTransferCheck);
    if (preTransferCheck.userExists) break;
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds between checks
  }

  // If still not recognized, attempt a tiny self-transfer from agent to itself to "activate" the account
  if (!preTransferCheck!.userExists) {
    console.warn("Deposit not recognized, attempting self-transfer to activate");

    const selfActivateResponse = await exchClient.usdSend({
      destination: agentAddress,
      amount: "0.01",
    });
    console.log("Self-activation usdSend (agent -> agent) Response:", selfActivateResponse);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    const postActivate = await infoClient.preTransferCheck({
      user: agentAddress,
      source: "0x2222222222222222222222222222222222222222",
    });
    if (!postActivate.userExists) {
      throw new Error("Agent Wallet activation failed");
    }
  }

  // Store agent private key securely
  localStorage.setItem("agentPrivateKey", agentPrivateKey);
  console.log("Agent Wallet Private Key stored:", agentPrivateKey);

  return { infoClient, exchClient, agentAddress };
};
