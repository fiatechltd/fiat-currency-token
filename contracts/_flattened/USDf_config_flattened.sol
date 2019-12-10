
// File: contracts\libs\SafeMathLib.sol

pragma solidity ^0.4.24;

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Safe maths
// ----------------------------------------------------------------------------

library SafeMathLib {
	
	using SafeMathLib for uint;
	
	/**
	 * @dev Sum two uint numbers.
	 * @param a Number 1
	 * @param b Number 2
	 * @return uint
	 */
    function add(uint a, uint b) internal pure returns (uint c) {
        c = a + b;
        require(c >= a, "SafeMathLib.add: required c >= a");
    }
	
	/**
	 * @dev Substraction of uint numbers.
	 * @param a Number 1
	 * @param b Number 2
	 * @return uint
	 */
    function sub(uint a, uint b) internal pure returns (uint c) {
        require(b <= a, "SafeMathLib.sub: required b <= a");
        c = a - b;
    }
	
	/**
	 * @dev Product of two uint numbers.
	 * @param a Number 1
	 * @param b Number 2
	 * @return uint
	 */
    function mul(uint a, uint b) internal pure returns (uint c) {
        c = a * b;
        require((a == 0 || c / a == b), "SafeMathLib.mul: required (a == 0 || c / a == b)");
    }
	
	/**
	 * @dev Division of two uint numbers.
	 * @param a Number 1
	 * @param b Number 2
	 * @return uint
	 */
    function div(uint a, uint b) internal pure returns (uint c) {
        require(b > 0, "SafeMathLib.div: required b > 0");
        c = a / b;
    }
	
	
	
	/**
	 * @dev Calculate percent as parts 'parts' per X amount 'perX' from given number 'amount'
	 * @param amount Amount to calculate percent for
	 * @param parts Parts of the percent e.g. (7) parts per 1000.
	 * @param perX Per X amount of the percent, like 7 parts per (1000) perX.
	 * @return uint percent amount tokens
	 */
	function percent(uint amount, uint parts, uint perX) internal pure returns (uint p) {
		require(perX > 0, "SafeMathLib.percent: required perX > 0");
        if (amount == 0)
			return 0;
		
		uint c = amount * parts;
        bool mulOverflow = (parts > 0 && c / amount != parts);
		
		// if mulOverflow, we do the division first instead of the multiplication
		// as we have the formula for percentage: percent = amount * parts / perX;
		if (mulOverflow)
			p = amount.div(perX).mul(parts);
		else p = amount.mul(parts).div(perX);
    }
}

// File: contracts\interfaces\IEtherReclaimer.sol

pragma solidity ^0.4.24;



/**
 * @dev IEtherReclaimer interface protocol used by owner to reclaim other amount sent to contract address.
 */
interface IEtherReclaimer {
	
	/**
	 * @dev Send all eth balance in the contract to another address
	 * @param _to Address to send contract ether balance to
	 * @return bool.
	 */
    function reclaimEther(address _to) external returns (bool success);
}

// File: contracts\Owned.sol

pragma solidity ^0.4.24;

/**
 * @dev Contract used to give other contracts ownership rights and management features.
 * based on:
 * https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/ownership/Ownable.sol
 */
contract Owned {
	
    address public owner;
    address public newOwner;
	
	/**
	 * @dev Event raised when ownership was transfered to a different address.
	 * @param _from Current owner address we transfer ownership from
	 * @param _to New owner address that just acquired ownership
	 */
    event OwnershipTransferred(address indexed _from, address indexed _to);
	
	
	
	/**
	 * @dev Constructor
	 */
    constructor() internal {
        owner = msg.sender;
		emit OwnershipTransferred(address(0), owner);
    }
	
    modifier onlyOwner {
        require(msg.sender == owner, "Owner required");
        _;
    }
	
	/**
	 * @dev Transfer ownership function
	 * @param _newOwner New owner address acquiring ownership of contract
	 */
    function transferOwnership(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }
	
	/**
	 * @dev New owner pending to accept ownership executes this function to confirm his ownership.
	 */
    function acceptOwnership() public {
        require(msg.sender == newOwner, "Owned: Only user with pending ownership acceptance can accept ownership!");
		
        emit OwnershipTransferred(owner, newOwner);
        
		owner = newOwner;
        newOwner = address(0);
    }
}

// File: contracts\EtherReclaimer.sol

pragma solidity ^0.4.24;



/**
 * @dev ERC20 Token, with symbol, name, standard and decimals among others.
 * Token units in this contract mean cents or pennies of the fiat currency it represents.
 */
contract EtherReclaimer is Owned
		, IEtherReclaimer
{
    /**
	 * @dev Constructor
	 */
    constructor()
		Owned()
		public
	{
    }
	
	/**
	 * Accept ETH
	 */
    function () external payable {
    }
	
	
	
	/**
	 * @dev Send all eth balance in the contract to another address
	 * @param _to Address to send contract ether balance to
	 * @return bool
	 */
    function reclaimEther(address _to) external onlyOwner returns (bool) {
        _to.transfer(address(this).balance);
		return true;
    }
}

// File: contracts\Mortal.sol

pragma solidity ^0.4.24;



/**
 * @dev Contract used to self destruct contract.
 */
contract Mortal is Owned {
    
	/**
	 * @dev Constructor
	 */
    constructor () internal {
    }
	
	/**
	 * @dev Destroy contract eliminating it from the blockchain
	 */
    function kill() public onlyOwner {
		// transfer available funds to owner
		selfdestruct(owner);
    }
}

// File: contracts\Named.sol

pragma solidity ^0.4.24;

/**
 * @dev Contract used to give a name to implementing contract.
 */
contract Named is Owned
{
	bytes32 public name;
	
	/**
	 * @dev Event raised when name was changed.
	 * @param _owner Contract owner performing the operation.
	 * @param _newName New name given to contract.
	 */
	event NameChanged(address indexed _owner, bytes32 _newName);
    
	
	
	/**
	 * @dev Constructor
	 */
    constructor() internal {
		name = "";
    }
	
    /**
	 * @dev Change contract name, only admin can do it.
	 * @param _newName New name given to contract.
	 */
    function setName(bytes32 _newName) public onlyOwner returns (bool success) {
		if (name != _newName) {
			name = _newName;
			emit NameChanged(msg.sender, _newName);
			return true;
		}
		return false;
    }
}

// File: contracts\interfaces\IConfigLibEvents.sol

pragma solidity ^0.4.24;



/**
 * @dev System Config library events interface.
 */
interface IConfigLibEvents
{
	/**
	 * @dev Event is raised when admin enables transfers.
	 * @param _admin Admin address performing the operation.
	 */
	event TransfersEnabled(address indexed _admin);
	
	/**
	 * @dev Event is raised when admin disables transfers.
	 * @param _admin Admin address performing the operation.
	 */
	event TransfersDisabled(address indexed _admin);
	
	
	
	/**
	 * @dev Event is raised when admin pauses contract operations.
	 * @param _admin Admin address performing the operation.
	 */
	event Paused(address indexed _admin);
	
	/**
	 * @dev Event is raised when admin resumes contract operations.
	 * @param _admin Admin address performing the operation.
	 */
	event Unpaused(address indexed _admin);
	
	
	
	/**
	 * @dev Event is raised when admin changes minimum withdrawal tokens.
	 * @param _admin Admin address performing the operation.
	 * @param _minWithdrawalAmount Current minimum withdrawal amount.
	 * @param _newMinWithdrawalAmount New minimum withdrawal amount.
	 */
	event MinWithdrawalAmountChanged(address indexed _admin, uint _minWithdrawalAmount, uint _newMinWithdrawalAmount);
	
	/**
	 * @dev Event is raised when admin changes maximum withdrawal tokens.
	 * @param _admin Admin address performing the operation.
	 * @param _maxWithdrawalAmount Current maximum withdrawal amount.
	 * @param _newMaxWithdrawalAmount New maximum withdrawal amount.
	 */
	event MaxWithdrawalAmountChanged(address indexed _admin, uint _maxWithdrawalAmount, uint _newMaxWithdrawalAmount);
	
	
	
	/**
	 * @dev Event is raised when admin enables deposits.
	 * @param _admin Admin address executing the function.
	 */
	event DepositsEnabled(address indexed _admin);
	
	/**
	 * @dev Event is raised when admin disables deposits.
	 * @param _admin Admin address executing the function.
	 */
	event DepositsDisabled(address indexed _admin);
	
	/**
	 * @dev Event is raised when admin enables withdrawals.
	 * @param _admin Admin address executing the function.
	 */
	event WithdrawalsEnabled(address indexed _admin);
	
	/**
	 * @dev Event is raised when admin disables withdrawals.
	 * @param _admin Admin address executing the function.
	 */
	event WithdrawalsDisabled(address indexed _admin);
	
	
	
	/**
	 * @dev Event is raised when a new no fee address was added.
	 * @param admin Admin address performing the operation.
	 * @param account New no fee address added.
	 */
	event NoFeeAddressAdded(address indexed admin, address indexed account);
	
	/**
	 * @dev Event is raised when a no fee address was removed.
	 * @param admin Admin address performing the operation.
	 * @param account No fee address being removed.
	 */
    event NoFeeAddressRemoved(address indexed admin, address indexed account);
	
	/**
	 * @dev Event is raised when no fee address renounces to his role.
	 * @param account No fee address renouncing to his role.
	 */
	event NoFeeAddressRenounced(address indexed account);
	
	
	
	/**
	 * @dev Event is raised when admin enables KYC filters.
	 * @param _admin Admin address performing the operation.
	 */
	event KYCEnabled(address indexed _admin);
	
	/**
	 * @dev Event is raised when admin disables KYC filters.
	 * @param _admin Admin address performing the operation.
	 */
	event KYCDisabled(address indexed _admin);
	
	/**
	 * @dev Event emitted when a user address was KYC approved.
	 * @param _admin Admin address performing the operation
	 * @param _userAddress User address that was KYC approved
	 */
    event KYCAddressApproved(address indexed _admin, address indexed _userAddress);
	
	/**
	 * @dev Event emitted when a user address was KYC disapproved.
	 * @param _admin Admin address performing the operation
	 * @param _userAddress User address that was KYC disapproved
	 */
    event KYCAddressDisapproved(address indexed _admin, address indexed _userAddress);
	
	/**
	 * @dev Event emitted when a user address was blacklisted due to suspicious operations.
	 * @param _admin Admin address performing the operation
	 * @param _userAddress User address that was blacklisted
	 */
    event BlacklistedAddress(address indexed _admin, address indexed _userAddress);
	
	/**
	 * @dev Event emitted when a user address was allowed to continue normal operations after being blacklisted due to suspicious operations.
	 * @param _admin Admin address performing the operation
	 * @param _userAddress User address that was allowed back to normal
	 */
    event AllowedBlacklistedAddress(address indexed _admin, address indexed _userAddress);
}

// File: contracts\interfaces\IAdmin.sol

pragma solidity ^0.4.24;

/**
 * @dev Interface for System Config admin.
 */
contract IAdmin
{
	function isAdmin(address _account) public view returns (bool);
	
	function addAdmin(address _account) public;
	
	function removeAdmin(address _account) public;
	
    function renounceAdmin() public;
}

// File: contracts\interfaces\IConfig.sol

pragma solidity ^0.4.24;

/**
 * @dev Interface for System Config contract.
 */
contract IConfig is IConfigLibEvents
{
	function isAdmin(address who) public view returns (bool);
	
	function canTransfer(address sender, address to) public view returns (bool);
	function canApprove(address sender, address spender) public view returns (bool);
	function canTransferFrom(address sender, address from, address to) public view returns (bool);
	function canDeposit(address sender, address to) public view returns (bool);
	function canWithdraw(address sender) public view returns (bool);
	function canWipeoutAddressBalance(address sender, address to) public view returns (bool);
	
	
	
	function feesCollectorWallet() public view returns (address);
	
	/**
	 * @dev Change transfer fees collector wallet, only owner can do it
	 * @param newWallet Set address to collect fees into
	 * @return bool
	 */
	function setFeesCollectorWallet(address newWallet) public returns (bool);
	
	function transferToYourselfIsWidrawal() public view returns (bool);
	
	/**
	 * @dev Set transfer to yourself is widrawal toggle enabled/disabled.
	 * @return bool
	 */
	function setTransferToYourselfIsWidrawal(bool enabled) public returns (bool);
	
	///*** TransfersController contract functions
	
	function transfersEnabled() public view returns (bool);
	
	/**
	 * @dev Enable transfers if they are disabled, executed only by admin.
	 * @return bool
	 */
	function enableTransfers(bool enable) public returns (bool);
	
	///*** TransfersController contract functions
	
	
	
	function depositsEnabled() public view returns (bool);
	
	function withdrawalsEnabled() public view returns (bool);
	
	function minWithdrawalAmount() public view returns (uint);
	
	function maxWithdrawalAmount() public view returns (uint);
	
	/**
	 * @dev Enable deposits if they are disabled, executed only by admin.
	 * @return bool
	 */
	function enableDeposits(bool enable) public returns (bool);
	
	/**
	 * @dev Enable withdrawals if they are disabled, executed only by admin.
	 * @return bool
	 */
	function enableWithdrawals(bool enable) public returns (bool);
	
	/**
	 * @dev Set/change minimum withdrawal amount, only admin can do it.
	 * @return bool
	 */
	function setMinWithdrawalAmount(uint _minAmount) public returns (bool);
	
	/**
	 * @dev Set/change maximum withdrawal amount, only admin can do it.
	 * @return bool
	 */
	function setMaxWithdrawalAmount(uint _maxAmount) public returns (bool);
	
	
	
	function pause() public returns (bool);
	function unpause() public returns (bool);
	
	function isPaused() public view returns (bool);
	
	
	
	function isNoFeeAddress(address _account) public view returns (bool);
	function isNoFeeAddress2(address _sender, address _account) public view returns (bool);
	function isNoFeeAddress3(address _sender, address _account1, address _account2) public view returns (bool);
	
    function addNoFeeAddress(address _account) public;
	
	function removeNoFeeAddress(address _account) public;
	
    function renounceNoFeeAddress() public;
	
	
	
	/**
	 * @dev Check if KYC is enabled.
	 * @return bool
	 */
	function isKYCEnabled() public view returns (bool);
	
	/**
	 * @dev Check if user address is KYC approved.
	 * @param _account User address
	 * @return bool
	 */
	function isKYCApproved(address _account) public view returns (bool);
	
	/**
	 * @dev Approve KYC user address, only admin can do it.
	 * @param _account User address
	 */
	function approveKYCUserAddress(address _account) public;
	
	/**
	 * @dev Disapprove KYC user address, only admin can do it.
	 * @param _account User address
	 */
	function disapproveKYCUserAddress(address _account) public;
	
	
	
	function isKYCDisabledOrApprovedAddress(address _address) public view returns (bool);
	
	/**
	 * @dev Enable/Disable KYC required.
	 * @param enable True to enable, false to disable.
	 * @return bool.
	 */
	function enableKYC(bool enable) public returns (bool success);
	
	
	
	function isNotBlacklisted(address _address) public view returns (bool success);
	
	/**
	 * @dev Check if user address is blacklisted.
	 * @param _account User address
	 * @return bool
	 */
	function isBlacklisted(address _account) public view returns (bool);
	
	/**
	 * @dev Blacklist user address, only admin can do it.
	 * @param _account User address
	 */
	function blacklistUserAddress(address _account) public;
	
	/**
	 * @dev Allow user address back to normal, only admin can do it.
	 * @param _account User address
	 */
	function allowBlacklistedUserAddress(address _account) public;
}

// File: contracts\HasAdmin.sol

pragma solidity ^0.4.24;

/**
 * @dev Base contract for admin contract as external contract usage.
 */
contract HasAdmin is Owned
{
	IAdmin public admins;
	
	/**
	 * @dev Constructor
	 */
    constructor(address _admins) internal {
		setIAdmin(_admins);
    }
	
	modifier onlyAdmin {
		require(admins.isAdmin(msg.sender), "Admin required");
		_;
	}
	
	function setIAdmin(address _admins) public onlyOwner {
		admins = IAdmin(_admins);
	}
}

// File: contracts\Config.sol

pragma solidity ^0.4.24;



/**
 * @dev Contract implementing System Config library to handle system management.
 */
contract Config is IConfigLibEvents
	, IConfig
	, Owned
	, Mortal
	, EtherReclaimer
	, Named
	, HasAdmin
{
	mapping (address => bool) noFeeAddress; //no fee addresses
	
	bool _transfersEnabled; // transfers enabled/disabled
	
	bool kycEnabled; // know your costumer enabled/disabled
	mapping (address => bool) kycApproved; // know your costumer approved addresses
	mapping (address => bool) blacklisted; // blacklisted addresses, disabled from performing any transfers or operations
	
	// wallet address where the fees are collected
	address _feesCollectorWallet;
	
	// if enabled, transfer to your same address is considered funds withdrawal
	bool _transferToYourselfIsWidrawal;
	
	// toggle to control deposits
	bool _depositsEnabled;
	
	// toggle to control withdrawals
	bool _withdrawalsEnabled;
	
	// minimum withdrawal amount
	uint _minWithdrawalAmount;
	
	// maximum withdrawal amount, 0 means disabled
	uint _maxWithdrawalAmount;
	
	bool paused; // contract emergency stop
	
	
	
	/**
	 * @dev Constructor
	 */
	constructor(address _admins)
		HasAdmin(_admins)
		public
	{
		bool _kycEnabled = false;
		init(_kycEnabled);
	}
	
	modifier whenNotPaused {
		require(!paused, "Paused");
		_;
	}
	
	function init(bool _kycEnabled) internal {
		//admins[msg.sender] = true;
		noFeeAddress[msg.sender] = true;
		
		_transfersEnabled = true;
		
		kycEnabled = _kycEnabled;
		kycApproved[msg.sender] = true;
		
		_feesCollectorWallet = msg.sender;
		_transferToYourselfIsWidrawal = true;
		
		_depositsEnabled = true;
		_withdrawalsEnabled = true;
		
		//50 usd or equivalent is default withdraw amount
		_minWithdrawalAmount = 5000;
		_maxWithdrawalAmount = 0; //disabled
		
		paused = false;
	}
	
	function isAdmin(address who) public view returns (bool)
	{
		return admins.isAdmin(who);
	}
	
	function canTransfer(address sender, address to) public view returns (bool) {
		return (!isPaused() && transfersEnabled()
				&& isKYCDisabledOrApprovedAddress(sender) && isNotBlacklisted(sender)
				&& isKYCDisabledOrApprovedAddress(to) && isNotBlacklisted(to));
		//require(!isPaused(), "Paused");
		//require(transfersEnabled(), "Transfers disabled");
		//require(isKYCDisabledOrApprovedAddress(sender), "KYC not approved");
		//require(isKYCDisabledOrApprovedAddress(to), "KYC not approved");
		//require(isNotBlacklisted(sender), "Blacklisted");
		//require(isNotBlacklisted(to), "Blacklisted");
		//return true;
	}
	
	function canApprove(address sender, address spender) public view returns (bool) {
		return (!isPaused() && transfersEnabled()
				&& isKYCDisabledOrApprovedAddress(sender) && isNotBlacklisted(sender)
				&& isKYCDisabledOrApprovedAddress(spender) && isNotBlacklisted(spender));
	}
	
	function canTransferFrom(address sender, address from, address to) public view returns (bool) {
		return (!isPaused() && transfersEnabled()
				&& isKYCDisabledOrApprovedAddress(sender) && isNotBlacklisted(sender)
				&& isKYCDisabledOrApprovedAddress(from) && isKYCDisabledOrApprovedAddress(to)
				&& isNotBlacklisted(from) && isNotBlacklisted(to));
	}
	
	function canDeposit(address sender, address to) public view returns (bool) {
		return (admins.isAdmin(sender) && !isPaused() && depositsEnabled() 
				&& isKYCDisabledOrApprovedAddress(to) && isNotBlacklisted(to));
				
		//require(admins.isAdmin(sender), "Admin required");
		//require(!isPaused(), "Paused");
		//require(depositsEnabled(), "Deposits disabled");
		//require(isKYCDisabledOrApprovedAddress(to), "KYC not approved");
		//require(isNotBlacklisted(to), "Blacklisted");
		//return true;
	}
	
	function canWithdraw(address sender) public view returns (bool) {
		return (!isPaused() && withdrawalsEnabled() && isKYCDisabledOrApprovedAddress(sender) && isNotBlacklisted(sender));
	}
	
	function canWipeoutAddressBalance(address sender, address to) public view returns (bool) {
		return (admins.isAdmin(sender) && !isPaused() && isBlacklisted(to));
	}
	
	
	
	function feesCollectorWallet() public view returns (address) {
		return _feesCollectorWallet;
	}
	
	/**
	 * @dev Change transfer fees collector wallet, only owner can do it
	 * @param newWallet Set address to collect fees into
	 * @return bool
	 */
	function setFeesCollectorWallet(address newWallet) public onlyOwner returns (bool) {
		if (newWallet != _feesCollectorWallet) {
			_feesCollectorWallet = newWallet;
			return true;
		}
		return false;
	}
	
	function transferToYourselfIsWidrawal() public view returns (bool) {
		return _transferToYourselfIsWidrawal;
	}
	
	/**
	 * @dev Set transfer to yourself is widrawal toggle enabled/disabled.
	 * @return bool
	 */
	function setTransferToYourselfIsWidrawal(bool enabled) public onlyOwner returns (bool) {
		if (enabled != _transferToYourselfIsWidrawal) {
			_transferToYourselfIsWidrawal = enabled;
			return true;
		}
		return false;
	}
	
	///*** TransfersController contract functions
	
	function transfersEnabled() public view returns (bool) {
		return _transfersEnabled;
	}
	
	/**
	 * @dev Enable transfers if they are disabled, executed only by admin.
	 * @return bool
	 */
	function enableTransfers(bool enable) public whenNotPaused onlyAdmin returns (bool) {
		if (_transfersEnabled != enable) {
			_transfersEnabled = enable;
			if (enable)
				emit TransfersEnabled(msg.sender);
			else emit TransfersDisabled(msg.sender);
			return true;
		}
		return false;
	}
	
	///*** TransfersController contract functions
	
	
	
	function depositsEnabled() public view returns (bool) {
		return _depositsEnabled;
	}
	
	function withdrawalsEnabled() public view returns (bool) {
		return _withdrawalsEnabled;
	}
	
	function minWithdrawalAmount() public view returns (uint) {
		return _minWithdrawalAmount;
	}
	
	function maxWithdrawalAmount() public view returns (uint) {
		return _maxWithdrawalAmount;
	}
	
	/**
	 * @dev Enable deposits if they are disabled, executed only by admin.
	 * @return bool
	 */
	function enableDeposits(bool enable) public onlyAdmin returns (bool) {
		if (_depositsEnabled != enable) {
			_depositsEnabled = enable;
			if (enable)
				emit DepositsEnabled(msg.sender);
			else emit DepositsDisabled(msg.sender);
			return true;
		}
		return false;
	}
	
	/**
	 * @dev Enable withdrawals if they are disabled, executed only by admin.
	 * @return bool
	 */
	function enableWithdrawals(bool enable) public onlyAdmin returns (bool) {
		if (_withdrawalsEnabled != enable) {
			_withdrawalsEnabled = enable;
			if (enable)
				emit WithdrawalsEnabled(msg.sender);
			else emit WithdrawalsDisabled(msg.sender);
			return true;
		}
		return false;
	}
	
	/**
	 * @dev Set/change minimum withdrawal amount, only admin can do it.
	 * @return bool
	 */
	function setMinWithdrawalAmount(uint _minAmount) public onlyAdmin returns (bool) {
		if (_minWithdrawalAmount != _minAmount) {
			emit MinWithdrawalAmountChanged(msg.sender, _minWithdrawalAmount, _minAmount);
			_minWithdrawalAmount = _minAmount;
			return true;
		}
		return false;
	}
	
	/**
	 * @dev Set/change maximum withdrawal amount, only admin can do it.
	 * @return bool
	 */
	function setMaxWithdrawalAmount(uint _maxAmount) public onlyAdmin returns (bool) {
		if (_maxWithdrawalAmount != _maxAmount) {
			emit MaxWithdrawalAmountChanged(msg.sender, _maxWithdrawalAmount, _maxAmount);
			_maxWithdrawalAmount = _maxAmount;
			return true;
		}
		return false;
	}
	
	
	
	function pause() public onlyAdmin returns (bool) {
		if (!paused) {
			paused = true;
			emit Paused(msg.sender);
			return true;
		}
		return false;
	}
	
	function unpause() public onlyAdmin returns (bool) {
		if (paused) {
			paused = false;
			emit Unpaused(msg.sender);
			return true;
		}
		return false;
	}
	
	function isPaused() public view returns (bool) {
        return paused;
    }
	
	
	
	function isNoFeeAddress(address _account) public view returns (bool) {
        return (noFeeAddress[_account] == true);
    }
	
	function isNoFeeAddress2(address _sender, address _account) public view returns (bool) {
		return (isNoFeeAddress(_sender) || isNoFeeAddress(_account));
	}
	
	function isNoFeeAddress3(address _sender, address _account1, address _account2) public view returns (bool) {
		return (isNoFeeAddress(_sender) || isNoFeeAddress(_account1) || isNoFeeAddress(_account2));
	}

    function addNoFeeAddress(address _account) public onlyOwner {
		require(!noFeeAddress[_account], "No fee address already added");
		noFeeAddress[_account] = true;
		emit NoFeeAddressAdded(msg.sender, _account);
    }
	
	function removeNoFeeAddress(address _account) public onlyOwner {
		require(noFeeAddress[_account], "Remove no fee address only");
		noFeeAddress[_account] = false;
		emit NoFeeAddressRemoved(msg.sender, _account);
    }
	
    function renounceNoFeeAddress() public {
		require(noFeeAddress[msg.sender], "Renounce no fee address only");
		noFeeAddress[msg.sender] = false;
		emit NoFeeAddressRenounced(msg.sender);
    }
	
	
	
	/**
	 * @dev Check if KYC is enabled.
	 * @return bool
	 */
	function isKYCEnabled() public view returns (bool) {
        return kycEnabled;
    }
	
	/**
	 * @dev Check if user address is KYC approved.
	 * @param _account User address
	 * @return bool
	 */
	function isKYCApproved(address _account) public view returns (bool) {
        return (kycApproved[_account] == true);
    }
	
	/**
	 * @dev Approve KYC user address, only admin can do it.
	 * @param _account User address
	 */
	function approveKYCUserAddress(address _account) public onlyAdmin {
		_approveKYCUserAddress(_account);
    }
	
	/**
	 * @dev Disapprove KYC user address, only admin can do it.
	 * @param _account User address
	 */
	function disapproveKYCUserAddress(address _account) public onlyAdmin {
		require(_account != owner, "Owner can not have his KYC status disapproved");
        _disapproveKYCUserAddress(_account);
    }
	
	/**
	 * @dev Approve KYC user address
	 * @param _account User address
	 */
    function _approveKYCUserAddress(address _account) internal {
		require(!kycApproved[_account], "KYC: Already approved");
        kycApproved[_account] = true;
        emit KYCAddressApproved(msg.sender, _account);
    }
	
	/**
	 * @dev Disapprove KYC user address
	 * @param _account User address
	 */
    function _disapproveKYCUserAddress(address _account) internal {
		require(kycApproved[_account], "KYC: Already disapproved");
        kycApproved[_account] = false;
        emit KYCAddressDisapproved(msg.sender, _account);
    }
	
	
	
	function isKYCDisabledOrApprovedAddress(address _address) public view returns (bool) {
		// if KYC is enabled, sender address must be approved
		return (!kycEnabled || isKYCApproved(_address));
	}
	
	/**
	 * @dev Enable/Disable KYC required.
	 * @param enable True to enable, false to disable.
	 * @return bool.
	 */
	function enableKYC(bool enable) public onlyAdmin returns (bool success) {
		if (kycEnabled != enable) {
			kycEnabled = enable;
			if (enable)
				emit KYCEnabled(msg.sender);
			else emit KYCDisabled(msg.sender);
			return true;
		}
		return false;
	}
	
	
	
	function isNotBlacklisted(address _account) public view returns (bool success) {
		// only allowed to continue if 'to' address is not blacklisted
		return (!isBlacklisted(_account));
	}
	
	
	
	/**
	 * @dev Check if user address is blacklisted.
	 * @param _account User address
	 * @return bool
	 */
	function isBlacklisted(address _account) public view returns (bool) {
        return (blacklisted[_account] == true);
    }
	
	/**
	 * @dev Blacklist user address, only admin can do it.
	 * @param _account User address
	 */
	function blacklistUserAddress(address _account) public onlyAdmin {
		require(_account != owner, "Owner can not be blacklisted");
		_blacklistUserAddress(_account);
    }
	
	/**
	 * @dev Allow user address back to normal, only admin can do it.
	 * @param _account User address
	 */
	function allowBlacklistedUserAddress(address _account) public onlyAdmin {
		_allowBlacklistedUserAddress(_account);
    }
	
	/**
	 * @dev Blacklist user address
	 * @param _account User address
	 */
    function _blacklistUserAddress(address _account) internal {
		require(!isBlacklisted(_account), "Already blacklisted");
        blacklisted[_account] = true;
        emit BlacklistedAddress(msg.sender, _account);
    }
	
	/**
	 * @dev Allow blacklisted user address back to normal operations
	 * @param _account User address
	 */
    function _allowBlacklistedUserAddress(address _account) internal {
		require(isBlacklisted(_account), "Already allowed");
        blacklisted[_account] = false;
        emit AllowedBlacklistedAddress(msg.sender, _account);
    }
}

// File: contracts\USDf_config.sol

pragma solidity ^0.4.24;

/**
 * @dev Top-level ERC20 compliant USD fiat currency token config contract.
 */
contract USDf_config is Config
{
	/**
	 * @dev Constructor
	 */
    constructor(address _admins)
		Config(_admins)
		public
	{
		name = "Fiatech USDf config";
    }
}
