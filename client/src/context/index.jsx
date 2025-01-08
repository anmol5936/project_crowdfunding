import React, { useContext, createContext, useState } from "react";
import { ethers } from "ethers";

// Context to provide state and methods
const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [signer, setSigner] = useState(null); // To manage signer state after connecting the wallet
  const [provider, setProvider] = useState(null); // To manage provider state after connecting
  const [address, setAddress] = useState(null); // To store the wallet address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address

  // Manual connection to the Ethereum provider
  const connect = async () => {
    try {
      // Request to connect with Ethereum provider (like MetaMask)
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Set provider and signer after connecting the wallet
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      const _signer = _provider.getSigner();
      const _address = await _signer.getAddress(); // Get the connected wallet address

      setProvider(_provider);
      setSigner(_signer);
      setAddress(_address); // Save the address in state

      console.log("Wallet connected", _address);
    } catch (error) {
      console.error("Failed to connect wallet", error);
    }
  };

  // Contract ABI (Replace with your actual ABI)
  const contractABI = [
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "campaigns",
      outputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "string", name: "title", type: "string" },
        { internalType: "string", name: "description", type: "string" },
        { internalType: "uint256", name: "target", type: "uint256" },
        { internalType: "uint256", name: "deadline", type: "uint256" },
        { internalType: "uint256", name: "amountCollected", type: "uint256" },
        { internalType: "string", name: "image", type: "string" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_owner", type: "address" },
        { internalType: "string", name: "_title", type: "string" },
        { internalType: "string", name: "_description", type: "string" },
        { internalType: "uint256", name: "_target", type: "uint256" },
        { internalType: "uint256", name: "_deadline", type: "uint256" },
        { internalType: "string", name: "_image", type: "string" },
      ],
      name: "createCampaign",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
      name: "donateToCampaign",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "getCampaigns",
      outputs: [
        {
          components: [
            { internalType: "address", name: "owner", type: "address" },
            { internalType: "string", name: "title", type: "string" },
            { internalType: "string", name: "description", type: "string" },
            { internalType: "uint256", name: "target", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "uint256", name: "amountCollected", type: "uint256" },
            { internalType: "string", name: "image", type: "string" },
          ],
          internalType: "struct CrowdFunding.Campaign[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
      name: "getDonators",
      outputs: [
        { internalType: "address[]", name: "", type: "address[]" },
        { internalType: "uint256[]", name: "", type: "uint256[]" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "numberOfCampaigns",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const contract = signer ? new ethers.Contract(contractAddress, contractABI, signer) : null;

  // Ensure the contract is initialized properly
  if (contract) {
    console.log("Contract initialized", contract);
  } else {
    console.log("Contract not initialized. Check wallet connection.");
  }

  // Function to create a campaign
  const publishCampaign = async (form) => {
    try {
      if (!signer) {
        console.error("No wallet connected");
        return;
      }
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const tx = await contract.createCampaign(
        await signer.getAddress(),
        form.title,
        form.description,
        ethers.utils.parseEther(form.target.toString()),
        new Date(form.deadline).getTime(),
        form.image
      );

      await tx.wait();
      console.log("Campaign created successfully", tx);
    } catch (error) {
      console.error("Error creating campaign", error);
    }
  };

   // Fetch all campaigns
   const getCampaigns = async () => {
    try {
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }
      const campaigns = await contract.getCampaigns();
      console.log("Campaigns fetched", campaigns);
      return campaigns.map((campaign, i) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: campaign.deadline.toNumber(),
        amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
        image: campaign.image,
        pId: i,
      }));
    } catch (error) {
      console.error("Error fetching campaigns", error);
    }
  };

  // Fetch campaigns for a specific user
  const getUserCampaigns = async () => {
    try {
      const allCampaigns = await getCampaigns();
      const userAddress = await signer.getAddress();
      return allCampaigns.filter((campaign) => campaign.owner === userAddress);
    } catch (error) {
      console.error("Error fetching user campaigns", error);
    }
  };

  // Donate to a campaign
  const donate = async (pId, amount) => {
    try {
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }
      const tx = await contract.donateToCampaign(pId, {
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      console.log("Donation successful", tx);
    } catch (error) {
      console.error("Error donating to campaign", error);
    }
  };

  // Get donations for a campaign
  const getDonations = async (pId) => {
    try {
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }
      const [donators, donations] = await contract.getDonators(pId);
      return donators.map((donator, index) => ({
        donator,
        donation: ethers.utils.formatEther(donations[index].toString()),
      }));
    } catch (error) {
      console.error("Error fetching donations", error);
    }
  };

  return (
    <StateContext.Provider
      value={{
        connect,
        publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        address, // Provide the user's address
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
