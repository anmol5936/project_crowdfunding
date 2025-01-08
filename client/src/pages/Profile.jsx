import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import { Activity, Users, Target } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [userDonations, setUserDonations] = useState([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalDonations: 0,
    activeCampaigns: 0
  });

  const { 
    address, 
    contract, 
    getUserCampaigns, 
    getUserDonations,
    getCampaignStats 
  } = useStateContext();

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const campaigns = await getUserCampaigns();
      const donations = await getUserDonations();
      
      let activeCampaignsCount = 0;
      for (const campaign of campaigns) {
        const stats = await getCampaignStats(campaign.pId);
        if (stats?.isActive) activeCampaignsCount++;
      }

      setUserCampaigns(campaigns);
      setUserDonations(donations);
      setStats({
        totalCampaigns: campaigns.length,
        totalDonations: donations.length,
        activeCampaigns: activeCampaignsCount
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract && address) {
      fetchUserData();
    }
  }, [address, contract]);

  if (!address) {
    return (
      <div className="min-h-screen bg-[#13131a] flex items-center justify-center font-epilogue">
        <p className="text-lg text-white">Please connect your wallet to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13131a] p-4 sm:p-8 font-epilogue">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-[#1c1c24] rounded-[15px] p-4 sm:p-6 mb-8">
          <h1 className="text-2xl font-epilogue font-semibold text-white mb-6">Profile Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#2c2f32] rounded-[10px] p-4 flex items-center">
              <div className="w-[40px] h-[40px] rounded-[10px] flex justify-center items-center bg-[#1c1c24]">
                <Target className="w-1/2 h-1/2 text-[#808191]" />
              </div>
              <div className="ml-4">
                <p className="font-epilogue font-normal text-[#808191] text-sm">Total Campaigns</p>
                <p className="font-epilogue font-semibold text-white text-xl">{stats.totalCampaigns}</p>
              </div>
            </div>
            <div className="bg-[#2c2f32] rounded-[10px] p-4 flex items-center">
              <div className="w-[40px] h-[40px] rounded-[10px] flex justify-center items-center bg-[#1c1c24]">
                <Activity className="w-1/2 h-1/2 text-[#808191]" />
              </div>
              <div className="ml-4">
                <p className="font-epilogue font-normal text-[#808191] text-sm">Active Campaigns</p>
                <p className="font-epilogue font-semibold text-white text-xl">{stats.activeCampaigns}</p>
              </div>
            </div>
            <div className="bg-[#2c2f32] rounded-[10px] p-4 flex items-center">
              <div className="w-[40px] h-[40px] rounded-[10px] flex justify-center items-center bg-[#1c1c24]">
                <Users className="w-1/2 h-1/2 text-[#808191]" />
              </div>
              <div className="ml-4">
                <p className="font-epilogue font-normal text-[#808191] text-sm">Campaigns Supported</p>
                <p className="font-epilogue font-semibold text-white text-xl">{stats.totalDonations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User's Campaigns */}
        <div className="bg-[#1c1c24] rounded-[15px] p-4 sm:p-6 mb-8">
          <h2 className="text-xl font-epilogue font-semibold text-white mb-6">Your Campaigns</h2>
          {isLoading ? (
            <p className="text-[#808191]">Loading campaigns...</p>
          ) : userCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCampaigns.map((campaign, i) => (
                <div key={i} className="bg-[#2c2f32] rounded-[15px] overflow-hidden">
                  <img 
                    src={campaign.image} 
                    alt={campaign.title}
                    className="w-full h-[158px] object-cover" 
                  />
                  <div className="p-4">
                    <h3 className="font-epilogue font-semibold text-white text-lg truncate">{campaign.title}</h3>
                    <div className="mt-3">
                      <div className="flex justify-between mb-2">
                        <div className="flex flex-col">
                          <p className="font-epilogue font-normal text-[#808191] text-sm">Target</p>
                          <p className="font-epilogue font-semibold text-white text-sm">{campaign.target} ETH</p>
                        </div>
                        <div className="flex flex-col">
                          <p className="font-epilogue font-normal text-[#808191] text-sm">Raised</p>
                          <p className="font-epilogue font-semibold text-white text-sm">{campaign.amountCollected} ETH</p>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-epilogue font-normal text-[#808191] text-sm">Ends on</p>
                        <p className="font-epilogue font-semibold text-white text-sm">{campaign.deadline}</p>
                      </div>
                      <div className="mt-2 px-3 py-1 bg-[#1c1c24] rounded-[5px] w-fit">
                        <p className="font-epilogue font-normal text-[#808191] text-sm">
                          Status: <span className={`text-${campaign.isActive ? '[#4acd8d]' : 'red-500'}`}>
                            {campaign.isActive ? 'Active' : 'Closed'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#808191]">You haven't created any campaigns yet.</p>
          )}
        </div>

        {/* User's Donations */}
        <div className="bg-[#1c1c24] rounded-[15px] p-4 sm:p-6">
          <h2 className="text-xl font-epilogue font-semibold text-white mb-6">Your Donations</h2>
          {isLoading ? (
            <p className="text-[#808191]">Loading donations...</p>
          ) : userDonations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDonations.map((donation, i) => (
                <div key={i} className="bg-[#2c2f32] rounded-[15px] overflow-hidden">
                  <img 
                    src={donation.image} 
                    alt={donation.title}
                    className="w-full h-[158px] object-cover" 
                  />
                  <div className="p-4">
                    <h3 className="font-epilogue font-semibold text-white text-lg truncate">{donation.title}</h3>
                    <div className="mt-3">
                      <div className="flex flex-col gap-2">
                        <div>
                          <p className="font-epilogue font-normal text-[#808191] text-sm">Campaign by</p>
                          <p className="font-epilogue font-semibold text-white text-sm">
                            {donation.owner.slice(0, 6)}...{donation.owner.slice(-4)}
                          </p>
                        </div>
                        <div className="w-full bg-[#1c1c24] rounded-[10px] mt-2">
                          <div 
                            className="bg-[#4acd8d] h-2 rounded-[10px]" 
                            style={{ 
                              width: `${Math.min(((Number(donation.amountCollected) / Number(donation.target)) * 100), 100)}%`
                            }}
                          />
                        </div>
                        <p className="font-epilogue font-normal text-[#808191] text-right text-sm">
                          Progress: {((Number(donation.amountCollected) / Number(donation.target)) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#808191]">You haven't made any donations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;