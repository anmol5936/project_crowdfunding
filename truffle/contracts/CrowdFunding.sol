// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Transaction {
        uint256 campaignId;
        string campaignTitle;
        uint256 amount;
        uint256 timestamp;
        TransactionType txType;
    }

    enum TransactionType { DONATION, WITHDRAWAL }

    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        bool isActive;
        bool targetReached;
        uint256 minimumContribution;
        string category;
        uint256 createdAt;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256[]) public userCampaigns;
    mapping(address => uint256[]) public userDonations;
    mapping(address => Transaction[]) public userTransactions;

    uint256 public numberOfCampaigns = 0;
    uint256 public platformFee = 25; // 0.25% fee

    event CampaignCreated(uint256 campaignId, address owner, string title, uint256 target);
    event DonationMade(uint256 campaignId, address donor, uint256 amount);
    event CampaignClosed(uint256 campaignId, bool targetReached);
    event FundsWithdrawn(uint256 campaignId, address owner, uint256 amount);
    event RefundIssued(uint256 campaignId, address donor, uint256 amount);

    
    modifier onlyCampaignOwner(uint256 _id) {
        require(campaigns[_id].owner == msg.sender, "Only campaign owner can perform this action");
        _;
    }

    modifier campaignExists(uint256 _id) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        _;
    }

    modifier campaignActive(uint256 _id) {
        require(campaigns[_id].isActive, "Campaign is not active");
        require(block.timestamp < campaigns[_id].deadline, "Campaign has ended");
        _;
    }

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image,
        uint256 _minimumContribution,
        string memory _category
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_target > 0, "Target amount must be greater than 0");
        require(_minimumContribution > 0, "Minimum contribution must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");

        Campaign storage campaign = campaigns[numberOfCampaigns];
        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.isActive = true;
        campaign.targetReached = false;
        campaign.minimumContribution = _minimumContribution;
        campaign.category = _category;
        campaign.createdAt = block.timestamp;

        userCampaigns[_owner].push(numberOfCampaigns);
        
        emit CampaignCreated(numberOfCampaigns, _owner, _title, _target);
        
        numberOfCampaigns++;
        return numberOfCampaigns - 1;
    }

    

      function donateToCampaign(uint256 _id) public payable campaignExists(_id) campaignActive(_id) {
        require(msg.value >= campaigns[_id].minimumContribution, "Donation below minimum contribution");
        
        uint256 fee = (msg.value * platformFee) / 10000;
        uint256 donation = msg.value - fee;
        
        Campaign storage campaign = campaigns[_id];
        campaign.donators.push(msg.sender);
        campaign.donations.push(donation);
        campaign.amountCollected += donation;
        
        userDonations[msg.sender].push(_id);

        // Record transaction
        userTransactions[msg.sender].push(Transaction({
            campaignId: _id,
            campaignTitle: campaign.title,
            amount: donation,
            timestamp: block.timestamp,
            txType: TransactionType.DONATION
        }));

        if (campaign.amountCollected >= campaign.target) {
            campaign.targetReached = true;
        }

        emit DonationMade(_id, msg.sender, donation);
        
        payable(campaign.owner).transfer(donation);
    }

    function getUserTransactions(address _user) public view returns (Transaction[] memory) {
        return userTransactions[_user];
    }

    function closeCampaign(uint256 _id) public onlyCampaignOwner(_id) campaignExists(_id) {
        Campaign storage campaign = campaigns[_id];
        require(campaign.isActive, "Campaign is already closed");
        
        campaign.isActive = false;
        emit CampaignClosed(_id, campaign.targetReached);
    }

    function getUserCampaigns(address _user) public view returns (uint256[] memory) {
        return userCampaigns[_user];
    }

    function getUserDonations(address _user) public view returns (uint256[] memory) {
        return userDonations[_user];
    }

    function getCampaignsByCategory(string memory _category) public view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](numberOfCampaigns);
        uint256 count = 0;
        
        for(uint256 i = 0; i < numberOfCampaigns; i++) {
            if (keccak256(bytes(campaigns[i].category)) == keccak256(bytes(_category))) {
                result[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(result, count)
        }
        
        return result;
    }

    function getDonators(uint256 _id) public view campaignExists(_id) 
        returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaignStats(uint256 _id) public view campaignExists(_id) 
        returns (
            uint256 totalDonors,
            uint256 averageDonation,
            uint256 timeLeft,
            bool isActive,
            bool targetReached
        ) {
        Campaign storage campaign = campaigns[_id];
        
        totalDonors = campaign.donators.length;
        averageDonation = totalDonors > 0 ? campaign.amountCollected / totalDonors : 0;
        timeLeft = block.timestamp < campaign.deadline ? campaign.deadline - block.timestamp : 0;
        isActive = campaign.isActive;
        targetReached = campaign.targetReached;
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);
        
        for(uint256 i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];
            allCampaigns[i] = item;
        }
        
        return allCampaigns;
    }

    function getActiveCampaigns() public view returns (uint256[] memory) {
        uint256[] memory activeCampaigns = new uint256[](numberOfCampaigns);
        uint256 count = 0;
        
        for(uint256 i = 0; i < numberOfCampaigns; i++) {
            if (campaigns[i].isActive && block.timestamp < campaigns[i].deadline) {
                activeCampaigns[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(activeCampaigns, count)
        }
        
        return activeCampaigns;
    }
}