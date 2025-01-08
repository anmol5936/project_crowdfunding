import React, { useState, useEffect } from 'react';
import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    sortBy: 'newest'
  });

  const { address, contract, getCampaigns, getActiveCampaigns } = useStateContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await getCampaigns();
      setCampaigns(data);
      applyFilters(data); // Apply filters to initial data
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters and search
  const applyFilters = (campaignsData = campaigns) => {
    let filtered = [...campaignsData];

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(campaign => 
        campaign.title.toLowerCase().includes(searchLower) ||
        campaign.description.toLowerCase().includes(searchLower) ||
        campaign.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(campaign => 
        campaign.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(campaign => {
        if (filters.status === 'active') return campaign.isActive && !campaign.targetReached;
        return !campaign.isActive || campaign.targetReached;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'target':
          return parseFloat(b.target) - parseFloat(a.target);
        case 'progress':
          const progressA = (parseFloat(a.amountCollected) / parseFloat(a.target)) * 100;
          const progressB = (parseFloat(b.amountCollected) / parseFloat(b.target)) * 100;
          return progressB - progressA;
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredCampaigns(filtered);
  };

  // Listen for changes in filters or search term
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters]);

  // Initial fetch
  useEffect(() => {
    if(contract) fetchCampaigns();
  }, [address, contract]);

  // Update search term
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Update filters
  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  return (
    <DisplayCampaigns 
      title={filters.status === 'active' ? "Active Campaigns" : "All Campaigns"}
      isLoading={isLoading}
      campaigns={filteredCampaigns}
      searchTerm={searchTerm}
      onSearch={handleSearch}
      filters={filters}
      onFilterChange={handleFilterChange}
    />
  );
};

export default Home;