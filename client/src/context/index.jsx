import React, { useContext, createContext, useState, useEffect } from "react";
import { ethers } from "ethers";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const contractAddress = "0x919850186ec2Af165021C2CBe865f57F58B85614";

  const contractABI =  [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "campaignId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "targetReached",
          "type": "bool"
        }
      ],
      "name": "CampaignClosed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "campaignId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "target",
          "type": "uint256"
        }
      ],
      "name": "CampaignCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "campaignId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "donor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "DonationMade",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "campaignId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundsWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "campaignId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "donor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "RefundIssued",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "campaigns",
      "outputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "target",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountCollected",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "image",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "targetReached",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "minimumContribution",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "category",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "numberOfCampaigns",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "platformFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userCampaigns",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userDonations",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userTransactions",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "campaignId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "campaignTitle",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "enum CrowdFunding.TransactionType",
          "name": "txType",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_target",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_deadline",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_image",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_minimumContribution",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_category",
          "type": "string"
        }
      ],
      "name": "createCampaign",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "donateToCampaign",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserTransactions",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "campaignId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "campaignTitle",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "enum CrowdFunding.TransactionType",
              "name": "txType",
              "type": "uint8"
            }
          ],
          "internalType": "struct CrowdFunding.Transaction[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "closeCampaign",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserCampaigns",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserDonations",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_category",
          "type": "string"
        }
      ],
      "name": "getCampaignsByCategory",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "getDonators",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        }
      ],
      "name": "getCampaignStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "totalDonors",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "averageDonation",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timeLeft",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "targetReached",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getCampaigns",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "target",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amountCollected",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "image",
              "type": "string"
            },
            {
              "internalType": "address[]",
              "name": "donators",
              "type": "address[]"
            },
            {
              "internalType": "uint256[]",
              "name": "donations",
              "type": "uint256[]"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "targetReached",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "minimumContribution",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "category",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "createdAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct CrowdFunding.Campaign[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getActiveCampaigns",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ];

  const disconnect = async () => {
    try {
      setSigner(null);
      setProvider(null);
      setAddress(null);
      setContract(null);
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  // Connect to MetaMask and initialize contract
  const connect = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const connectedAddress = accounts[0];
      
      // Create Web3Provider instance
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      setProvider(provider);
      setSigner(signer);
      setAddress(connectedAddress);

      const contractInstance = new ethers.Contract(
        contractAddress, 
        contractABI, 
        signer
      );
      setContract(contractInstance);

      console.log("Connected to MetaMask:", connectedAddress);
      return contractInstance;
    } catch (error) {
      console.error("Connection error:", error);
      throw error;
    }
  };

  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
      await disconnect();
    } else if (accounts[0] !== address) {
      // Reload the page when they change accounts
      window.location.reload();
    }
  };

  // Handle chain changes
  const handleChainChanged = () => {
    // Reload the page when they change networks
    window.location.reload();
  };

  useEffect(() => {
    // Subscribe to accounts change
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            connect();
          }
        })
        .catch(console.error);
    }

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Get all campaigns with enhanced data
  const getCampaigns = async () => {
    try {
      if (!contract) {
        console.error("Contract not initialized");
        return [];
      }

      const campaigns = await contract.getCampaigns();
      
      const parsedCampaigns = campaigns.map((campaign, i) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: new Date(campaign.deadline.toNumber() * 1000).toLocaleDateString(),
        amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
        image: campaign.image,
        isActive: campaign.isActive,
        targetReached: campaign.targetReached,
        minimumContribution: ethers.utils.formatEther(campaign.minimumContribution.toString()),
        category: campaign.category,
        createdAt: new Date(campaign.createdAt.toNumber() * 1000).toLocaleDateString(),
        pId: i
      }));

      return parsedCampaigns;
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  };

  // Create campaign with enhanced parameters
  const publishCampaign = async (form) => {
    try {
      if (!contract) await connect();
      
      const data = await contract.createCampaign(
        address, // owner
        form.title,
        form.description,
        ethers.utils.parseEther(form.target),
        Math.floor(new Date(form.deadline).getTime() / 1000),
        form.image,
        ethers.utils.parseEther(form.minimumContribution || "0.01"),
        form.category || "General"
      );

      await data.wait();
      console.log("Campaign created successfully");
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw error;
    }
  };

  // Get campaigns by category
  const getCampaignsByCategory = async (category) => {
    try {
      if (!contract) await connect();
      
      const campaignIds = await contract.getCampaignsByCategory(category);
      const allCampaigns = await getCampaigns();
      return campaignIds.map(id => allCampaigns[id.toNumber()]);
    } catch (error) {
      console.error("Error fetching campaigns by category:", error);
      return [];
    }
  };

  // Get active campaigns
  const getActiveCampaigns = async () => {
    try {
      if (!contract) await connect();
      
      const campaignIds = await contract.getActiveCampaigns();
      const allCampaigns = await getCampaigns();
      return campaignIds.map(id => allCampaigns[id.toNumber()]);
    } catch (error) {
      console.error("Error fetching active campaigns:", error);
      return [];
    }
  };

  // Get campaign statistics
  const getCampaignStats = async (pId) => {
    try {
      if (!contract) await connect();
      
      const stats = await contract.getCampaignStats(pId);
      return {
        totalDonors: stats.totalDonors.toNumber(),
        averageDonation: ethers.utils.formatEther(stats.averageDonation),
        timeLeft: stats.timeLeft.toNumber(),
        isActive: stats.isActive,
        targetReached: stats.targetReached
      };
    } catch (error) {
      console.error("Error fetching campaign stats:", error);
      return null;
    }
  };

  // Close campaign
  const closeCampaign = async (pId) => {
    try {
      if (!contract) await connect();
      
      const data = await contract.closeCampaign(pId);
      await data.wait();
      console.log("Campaign closed successfully");
    } catch (error) {
      console.error("Error closing campaign:", error);
    }
  };

  // Get user campaigns
  const getUserCampaigns = async () => {
    try {
      if (!contract) await connect();
      
      const campaignIds = await contract.getUserCampaigns(address);
      const allCampaigns = await getCampaigns();
      return campaignIds.map(id => allCampaigns[id.toNumber()]);
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
      return [];
    }
  };

  // Get user donations
  const getUserDonations = async () => {
    try {
      if (!contract) await connect();
      
      const donationIds = await contract.getUserDonations(address);
      const allCampaigns = await getCampaigns();
      return donationIds.map(id => allCampaigns[id.toNumber()]);
    } catch (error) {
      console.error("Error fetching user donations:", error);
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
        publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        disconnect,
        // New functions
        getCampaignsByCategory,
        getActiveCampaigns,
        getCampaignStats,
        closeCampaign,
        getUserDonations
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);