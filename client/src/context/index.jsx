import React, { useContext, createContext, useState, useEffect } from "react";
import { ethers } from "ethers";

const StateContext = createContext();

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
          { internalType: "address[]", name: "donators", type: "address[]" },
          { internalType: "uint256[]", name: "donations", type: "uint256[]" },
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

export const StateContextProvider = ({ children }) => {
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const contractAddress = "0x6Ef4045d5Cd922d579C2D9CfacD79656beBC07C6"; // Your deployed contract address

  // Connect to Ganache and initialize contract
  const connect = async () => {
    try {
      // Connect directly to Ganache
      const ganacheProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
      const ganacheSigner = ganacheProvider.getSigner();
      
      setProvider(ganacheProvider);
      setSigner(ganacheSigner);
      
      // Get the connected address
      const connectedAddress = await ganacheSigner.getAddress();
      setAddress(connectedAddress);

      // Initialize contract with Ganache provider
      const contractInstance = new ethers.Contract(contractAddress, contractABI, ganacheSigner);
      setContract(contractInstance);

      console.log("Connected to Ganache:", connectedAddress);
      return contractInstance;
    } catch (error) {
      console.error("Connection error:", error);
      throw error;
    }
  };

  // Connect on component mount
  useEffect(() => {
    connect();
  }, []);

  // Get all campaigns
  const getCampaigns = async () => {
    try {
      if (!contract) {
        console.error("Contract not initialized");
        return [];
      }

      const campaigns = await contract.getCampaigns();
      console.log("Raw campaigns data:", campaigns);

      const parsedCampaigns = campaigns.map((campaign, i) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: new Date(campaign.deadline.toNumber() * 1000).toLocaleDateString(),
        amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
        image: campaign.image,
        pId: i
      }));

      console.log("Parsed campaigns:", parsedCampaigns);
      return parsedCampaigns;
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  };

  // Create a campaign
  const publishCampaign = async (form) => {
    try {
      if (!contract) await connect();
      
      const data = await contract.createCampaign(
        address, // owner
        form.title,
        form.description,
        ethers.utils.parseEther(form.target),
        Math.floor(new Date(form.deadline).getTime() / 1000), // Convert to Unix timestamp
        form.image
      );

      await data.wait();
      console.log("Campaign created successfully");
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  // Get user campaigns
  const getUserCampaigns = async () => {
    try {
      const allCampaigns = await getCampaigns();
      return allCampaigns.filter((campaign) => 
        campaign.owner.toLowerCase() === address?.toLowerCase()
      );
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
      return [];
    }
  };

  // Donate to campaign
  const donate = async (pId, amount) => {
    try {
      if (!contract) await connect();
      
      const data = await contract.donateToCampaign(pId, {
        value: ethers.utils.parseEther(amount)
      });

      await data.wait();
      console.log("Donation successful");
    } catch (error) {
      console.error("Error donating:", error);
    }
  };

  // Get campaign donations
  const getDonations = async (pId) => {
    try {
      if (!contract) await connect();
      
      const [donators, donations] = await contract.getDonators(pId);
      
      return donators.map((donator, index) => ({
        donator,
        donation: ethers.utils.formatEther(donations[index].toString())
      }));
    } catch (error) {
      console.error("Error fetching donations:", error);
      return [];
    }
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);