import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Search, Filter, X } from 'lucide-react';
import { useStateContext } from '../context';
import { CustomButton } from './';
import { logo, menu, thirdweb } from '../assets';
import { navlinks } from '../constants';

const Navbar = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState('dashboard');
  const [toggleDrawer, setToggleDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { connect, disconnect, address, getCampaigns } = useStateContext();

  // Enhanced filter options
  const [filters, setFilters] = useState({
    status: 'all', // all, active, completed
    category: 'all',
    sortBy: 'newest' // newest, oldest, target, progress
  });

  const categories = [
    'all',
    'Technology',
    'Education',
    'Healthcare',
    'Environment',
    'Community',
    'Creative'
  ];

  // Debounced search function
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filters]);

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/');
    };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const allCampaigns = await getCampaigns();
      let filtered = allCampaigns;

      // Apply search term filter
      filtered = filtered.filter(campaign => {
        const searchLower = searchTerm.toLowerCase();
        return (
          campaign.title.toLowerCase().includes(searchLower) ||
          campaign.description.toLowerCase().includes(searchLower) ||
          campaign.category.toLowerCase().includes(searchLower)
        );
      });

      // Apply category filter
      if (filters.category !== 'all') {
        filtered = filtered.filter(campaign => 
          campaign.category.toLowerCase() === filters.category.toLowerCase()
        );
      }

      // Apply status filter
      if (filters.status !== 'all') {
        filtered = filtered.filter(campaign => {
          if (filters.status === 'active') return campaign.isActive;
          return !campaign.isActive;
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

      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  return (
    <div className="flex md:flex-row flex-col-reverse justify-between mb-[35px] gap-6">
      <div className="lg:flex-1 flex flex-col max-w-[458px] relative">
        {/* Search Bar */}
        <div className="flex flex-row py-2 pl-4 pr-2 h-[52px] bg-[#1c1c24] rounded-[100px]">
          <input
            type="text"
            placeholder="Search for campaigns"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex w-full font-epilogue font-normal text-[14px] placeholder:text-[#4b5264] text-white bg-transparent outline-none"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="w-[52px] h-full flex justify-center items-center cursor-pointer hover:opacity-80"
            >
              <X className="w-[20px] h-[20px] text-[#4b5264]" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-[52px] h-full flex justify-center items-center cursor-pointer hover:opacity-80"
          >
            <Filter className={`w-[20px] h-[20px] ${showFilters ? 'text-[#4acd8d]' : 'text-[#4b5264]'}`} />
          </button>
        </div>

        {/* Enhanced Filters */}
        {showFilters && (
          <div className="absolute top-[60px] left-0 right-0 p-4 bg-[#1c1c24] rounded-[10px] shadow-lg z-10 border border-[#3a3a43]">
            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="text-white font-epilogue text-sm block mb-2">Category:</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 rounded-md bg-[#2c2f32] text-[#808191] border border-[#3a3a43] focus:outline-none focus:border-[#4acd8d]"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-white font-epilogue text-sm block mb-2">Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 rounded-md bg-[#2c2f32] text-[#808191] border border-[#3a3a43] focus:outline-none focus:border-[#4acd8d]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-white font-epilogue text-sm block mb-2">Sort By:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2 rounded-md bg-[#2c2f32] text-[#808191] border border-[#3a3a43] focus:outline-none focus:border-[#4acd8d]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="target">Highest Target</option>
                  <option value="progress">Most Progress</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute top-[60px] left-0 right-0 bg-[#1c1c24] rounded-[10px] shadow-lg z-20 max-h-[400px] overflow-y-auto">
            {searchResults.map((campaign, index) => (
              <div
                key={index}
                className="p-4 hover:bg-[#2c2f32] cursor-pointer border-b border-[#3a3a43] last:border-b-0"
                onClick={() => navigate(`/campaign-details/${campaign.pId}`)}
              >
                <h3 className="text-white font-epilogue font-semibold">{campaign.title}</h3>
                <p className="text-[#808191] text-sm mt-1">{campaign.description.substring(0, 100)}...</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[#4acd8d] text-xs">{campaign.category}</span>
                  <span className="text-[#808191] text-xs">•</span>
                  <span className="text-[#808191] text-xs">
                    Target: {campaign.target} ETH
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="absolute top-[60px] left-0 right-0 bg-[#1c1c24] rounded-[10px] shadow-lg z-20 p-4 text-center">
            <p className="text-[#808191]">Searching...</p>
          </div>
        )}
      </div>

      {/* Rest of the component remains the same */}
      {/* Desktop Navigation */}
      <div className="sm:flex hidden flex-row justify-end gap-4">
        <CustomButton
          btnType="button"
          title={address ? 'Create a campaign' : 'Connect'}
          styles={address ? 'bg-[#1dc071]' : 'bg-[#8c6dfd]'}
          handleClick={() => {
            if (address) navigate('create-campaign');
            else connect();
          }}
        />

        {address && (
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <div className="w-[52px] h-[52px] rounded-full bg-[#2c2f32] flex justify-center items-center cursor-pointer hover:bg-[#3a3a43] transition-colors">
                <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain" />
              </div>
            </Link>
            <button
              onClick={handleDisconnect}
              className="w-[52px] h-[52px] rounded-full bg-[#2c2f32] flex justify-center items-center cursor-pointer hover:bg-[#3a3a43] transition-colors"
              title="Disconnect Wallet"
            >
              <LogOut className="w-[60%] h-[60%] text-[#808191]" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden flex justify-between items-center relative">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#2c2f32] flex justify-center items-center cursor-pointer">
          <img src={logo} alt="logo" className="w-[60%] h-[60%] object-contain" />
        </div>

        <img
          src={menu}
          alt="menu"
          className="w-[34px] h-[34px] object-contain cursor-pointer"
          onClick={() => setToggleDrawer((prev) => !prev)}
        />

        <div
          className={`absolute top-[60px] right-0 left-0 bg-[#1c1c24] z-10 shadow-secondary py-4 ${
            !toggleDrawer ? '-translate-y-[100vh]' : 'translate-y-0'
          } transition-all duration-700`}
        >
          <ul className="mb-4">
            {navlinks.map((link) => (
              <li
                key={link.name}
                className={`flex p-4 ${isActive === link.name ? 'bg-[#3a3a43]' : ''} cursor-pointer hover:bg-[#3a3a43] transition-colors`}
                onClick={() => {
                  setIsActive(link.name);
                  setToggleDrawer(false);
                  navigate(link.link);
                }}
              >
                <img
                  src={link.imgUrl}
                  alt={link.name}
                  className={`w-[24px] h-[24px] object-contain ${
                    isActive === link.name ? 'grayscale-0' : 'grayscale'
                  }`}
                />
                <p
                  className={`ml-[20px] font-epilogue font-semibold text-[14px] ${
                    isActive === link.name ? 'text-[#1dc071]' : 'text-[#808191]'
                  }`}
                >
                  {link.name}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 mx-4">
            <CustomButton
              btnType="button"
              title={address ? 'Create a campaign' : 'Connect'}
              styles={address ? 'bg-[#1dc071]' : 'bg-[#8c6dfd]'}
              handleClick={() => {
                if (address) navigate('create-campaign');
                else connect();
              }}
            />
            
            {address && (
              <CustomButton
                btnType="button"
                title="Disconnect Wallet"
                styles="bg-[#3a3a43] hover:bg-[#4a4a53]"
                handleClick={handleDisconnect}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;