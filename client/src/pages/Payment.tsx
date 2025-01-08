import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { Wallet, ArrowRight, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ethers } from 'ethers';

const Payment = () => {
  const { address, contract } = useStateContext();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [displayedTransactions, setDisplayedTransactions] = useState([]);

  useEffect(() => {
    const getBalance = async () => {
      if (address && window.ethereum) {
        try {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          
          const formattedBalance = ethers.utils.formatEther(balance);
          setBalance(parseFloat(formattedBalance).toFixed(4));
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    const getTransactions = async () => {
      if (contract && address) {
        setLoading(true);
        try {
          // Get user's donations (outgoing)
          const donationTxs = await contract.getUserTransactions(address);
          
          // Get campaigns where user received donations (incoming)
          const userCampaigns = await contract.getUserCampaigns(address);
          let incomingTxs = [];
          
          for (const campaignId of userCampaigns) {
            const [donators, donations] = await contract.getDonators(campaignId);
            const campaign = (await contract.campaigns(campaignId));
            
            // Create transaction objects for incoming donations
            const campaignDonations = donators.map((donator, index) => ({
              campaignId: campaignId.toNumber(),
              campaignTitle: campaign.title,
              amount: donations[index],
              timestamp: campaign.createdAt, // Using campaign creation time as we don't have exact donation time
              type: 'INCOMING',
              from: donator
            }));
            
            incomingTxs = [...incomingTxs, ...campaignDonations];
          }

          // Format all transactions
          const formattedDonations = donationTxs.map(tx => ({
            campaignId: tx.campaignId.toNumber(),
            campaignTitle: tx.campaignTitle,
            amount: ethers.utils.formatEther(tx.amount),
            timestamp: new Date(tx.timestamp.toNumber() * 1000),
            type: tx.txType === 0 ? 'DONATION' : 'WITHDRAWAL',
            from: address
          }));

          const formattedIncoming = incomingTxs.map(tx => ({
            campaignId: tx.campaignId,
            campaignTitle: tx.campaignTitle,
            amount: ethers.utils.formatEther(tx.amount),
            timestamp: new Date(tx.timestamp.toNumber() * 1000),
            type: 'INCOMING',
            from: tx.from
          }));

          // Combine and sort all transactions
          const allTxs = [...formattedDonations, ...formattedIncoming];
          allTxs.sort((a, b) => b.timestamp - a.timestamp);
          
          setTransactions(allTxs);
          setDisplayedTransactions(showAllTransactions ? allTxs : allTxs.slice(0, 5));
        } catch (error) {
          console.error("Error fetching transactions:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    getBalance();
    getTransactions();
    
    const balanceInterval = setInterval(getBalance, 10000);
    return () => clearInterval(balanceInterval);
  }, [address, contract, showAllTransactions]);

  useEffect(() => {
    setDisplayedTransactions(showAllTransactions ? transactions : transactions.slice(0, 5));
  }, [transactions, showAllTransactions]);

  if (!address) {
    return (
      <div className="min-h-screen bg-[#13131a] flex items-center justify-center p-4">
        <div className="bg-[#1c1c24] p-8 rounded-lg max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-[#808191] mx-auto mb-4" />
          <p className="text-white font-epilogue text-lg mb-4">Please connect your wallet to view payment details</p>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'DONATION':
        return <ArrowUpRight className="w-8 h-8 text-red-500 bg-red-500/10 rounded-full p-1.5" />;
      case 'WITHDRAWAL':
        return <ArrowDownRight className="w-8 h-8 text-yellow-500 bg-yellow-500/10 rounded-full p-1.5" />;
      case 'INCOMING':
        return <ArrowDownRight className="w-8 h-8 text-green-500 bg-green-500/10 rounded-full p-1.5" />;
      default:
        return <ArrowRight className="w-8 h-8 text-gray-500 bg-gray-500/10 rounded-full p-1.5" />;
    }
  };

  const getTransactionText = (tx) => {
    switch (tx.type) {
      case 'DONATION':
        return `Donated to ${tx.campaignTitle}`;
      case 'WITHDRAWAL':
        return `Withdrawn from ${tx.campaignTitle}`;
      case 'INCOMING':
        return `Received donation for ${tx.campaignTitle}`;
      default:
        return 'Transaction';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'DONATION':
        return 'text-red-500';
      case 'WITHDRAWAL':
        return 'text-yellow-500';
      case 'INCOMING':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#13131a] p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white font-epilogue font-semibold text-[18px] mb-8">Payment Dashboard</h1>
        
        {/* Wallet Overview */}
        <div className="bg-[#1c1c24] rounded-[15px] p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Wallet className="w-8 h-8 text-[#4acd8d]" />
            <h2 className="text-white font-epilogue font-semibold text-[16px]">Wallet Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#2c2f32] rounded-[10px] p-6">
              <p className="text-[#808191] font-epilogue text-sm mb-2">Current Balance</p>
              <p className="text-white font-epilogue font-semibold text-2xl">{balance} ETH</p>
            </div>
            
            <div className="bg-[#2c2f32] rounded-[10px] p-6">
              <p className="text-[#808191] font-epilogue text-sm mb-2">Wallet Address</p>
              <p className="text-white font-epilogue font-medium text-sm break-all">
                {address}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#1c1c24] rounded-[15px] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-epilogue font-semibold text-[16px]">
              {showAllTransactions ? 'All Transactions' : 'Recent Transactions'}
            </h2>
            <button 
              onClick={() => setShowAllTransactions(!showAllTransactions)}
              className="text-[#4acd8d] font-epilogue text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {showAllTransactions ? 'Show Less' : 'View All'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <p className="text-[#808191] font-epilogue text-center py-4">Loading transactions...</p>
          ) : displayedTransactions.length === 0 ? (
            <div className="bg-[#2c2f32] rounded-[10px] p-4">
              <p className="text-[#808191] font-epilogue text-sm">No recent transactions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedTransactions.map((tx, index) => (
                <div key={index} className="bg-[#2c2f32] rounded-[10px] p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <p className="text-white font-epilogue font-medium">
                          {getTransactionText(tx)}
                        </p>
                        <p className="text-[#808191] font-epilogue text-sm">
                          {formatDate(tx.timestamp)}
                        </p>
                        <p className="text-[#808191] font-epilogue text-xs">
                          From: {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-epilogue font-medium ${getTransactionColor(tx.type)}`}>
                      {tx.type === 'DONATION' ? '-' : '+'}{tx.amount} ETH
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;