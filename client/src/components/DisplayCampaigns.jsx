import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loader } from '../assets';
import FundCard from './FundCard';

const DisplayCampaigns = ({ 
  title, 
  isLoading, 
  campaigns,
  filters,
  onFilterChange
}) => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCampaigns, setFilteredCampaigns] = useState(campaigns);

  const categories = [
    'General',
    'Technology',
    'Healthcare',
    'Education',
    'Environment',
    'Community',
    'Creative',
    'Business',
    'Charity',
    'Other'
  ];

  // Apply filters and sorting
  useEffect(() => {
    let result = [...campaigns];

    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(campaign => 
        campaign.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(campaign => {
        if (filters.status === 'active') return campaign.isActive && !campaign.targetReached;
        return !campaign.isActive || campaign.targetReached;
      });
    }

    setFilteredCampaigns(result);
  }, [campaigns, filters]);

  const handleCardClick = (campaign) => {
    navigate(`/campaign-details/${campaign.pId}`, {
      state: campaign
    });
  };

  return (
    <div className="container mx-auto px-4">
      {/* Main Header */}
      <div className="mb-8">
        <h1 className="font-epilogue font-bold text-2xl text-white mb-2">
          {title}
        </h1>
        <p className="text-[#808191]">
          {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Filter Section */}
      <div className="mb-8 shadow-lg">
        <div className="flex justify-start">
          {/* Filter Button and Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#2c2f32] rounded-lg hover:bg-[#3a3a43] transition-colors group"
            >
              <Filter className={`w-5 h-5 ${showFilters ? 'text-[#4acd8d]' : 'text-[#4b5264] group-hover:text-white'}`} />
              <span className="text-white font-epilogue">Filters</span>
            </button>

            {showFilters && (
              <div className="absolute mt-2 w-72 p-4 bg-[#2c2f32] rounded-xl shadow-xl z-10 border border-[#3a3a43]">
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-white font-epilogue text-sm block mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => onFilterChange('category', e.target.value)}
                      className="w-full p-3 rounded-lg bg-[#1c1c24] text-white border border-[#3a3a43] focus:outline-none focus:border-[#4acd8d] transition-colors"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category.toLowerCase()} value={category.toLowerCase()}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-white font-epilogue text-sm block mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => onFilterChange('status', e.target.value)}
                      className="w-full p-3 rounded-lg bg-[#1c1c24] text-white border border-[#3a3a43] focus:outline-none focus:border-[#4acd8d] transition-colors"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && (
          <div className="col-span-full flex justify-center items-center py-12">
            <img src={loader} alt="loader" className="w-[100px] h-[100px] object-contain" />
          </div>
        )}

        {!isLoading && filteredCampaigns.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="font-epilogue font-semibold text-[#818183] text-lg">
              No campaigns found
            </p>
            <p className="text-[#4b5264] mt-2">
              Try adjusting your filters to find what you're looking for
            </p>
          </div>
        )}

        {!isLoading && filteredCampaigns.length > 0 && filteredCampaigns.map((campaign) => (
          <FundCard 
            key={campaign.pId}
            {...campaign}
            handleClick={() => handleCardClick(campaign)}
          />
        ))}
      </div>
    </div>
  );
};

export default DisplayCampaigns;