pragma solidity ^0.4.24;

import "./EtherReclaimer.sol";
import "./Owned.sol";
import "./Mortal.sol";
import "./Named.sol";

//import "./libs/ConfigLib.sol";
import "./libs/IConfigLibEvents.sol";
import "./libs/IConfig.sol";



/**
 * @dev Contract implementing System Config library to handle system management.
 */
contract Config is IConfigLibEvents
	//, ConfigLib
	, IConfig
	, Owned
	, Mortal
	, EtherReclaimer
	, Named
{
	mapping (address => bool) admins; //admins addresses
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
	
	
	
	
	constructor() public {
		bool _kycEnabled = false;
		init(_kycEnabled);
	}
	
	modifier onlyAdmin {
		require(admins[msg.sender] == true, "Admin required");
		_;
	}
	
	modifier whenNotPaused {
		require(!paused, "Paused");
		_;
	}
	
	function init(bool _kycEnabled) internal {
		admins[msg.sender] = true;
		noFeeAddress[msg.sender] = true;
		
		_transfersEnabled = true;
		
		kycEnabled = _kycEnabled;
		_feesCollectorWallet = msg.sender;
		_transferToYourselfIsWidrawal = true;
		
		_depositsEnabled = true;
		_withdrawalsEnabled = true;
		
		//50 usd or equivalent is default withdraw amount
		_minWithdrawalAmount = 5000;
		_maxWithdrawalAmount = 0; //disabled
		
		paused = false;
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
		return (isAdmin(sender) && !isPaused() && depositsEnabled() 
				&& isKYCDisabledOrApprovedAddress(to) && isNotBlacklisted(to));
				
		//require(isAdmin(sender), "Admin required");
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
		return (isAdmin(sender) && !isPaused() && isBlacklisted(to));
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
	function enableTransfers() public whenNotPaused onlyAdmin returns (bool) {
		if (!_transfersEnabled) {
			_transfersEnabled = true;
			emit TransfersEnabled(msg.sender);
			return true;
		}
		return false;
	}
	
	function disableTransfers() public whenNotPaused onlyAdmin returns (bool) {
		if (_transfersEnabled) {
			_transfersEnabled = false;
			emit TransfersDisabled(msg.sender);
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
	function enableDeposits() public onlyAdmin returns (bool) {
		if (!_depositsEnabled) {
			_depositsEnabled = true;
			emit DepositsEnabled(msg.sender);
			return true;
		}
		return false;
	}
	
	function disableDeposits() public onlyAdmin returns (bool) {
		if (_depositsEnabled) {
			_depositsEnabled = false;
			emit DepositsDisabled(msg.sender);
			return true;
		}
		return false;
	}
	
	/**
	 * @dev Enable withdrawals if they are disabled, executed only by admin.
	 * @return bool
	 */
	function enableWithdrawals() public onlyAdmin returns (bool) {
		if (!_withdrawalsEnabled) {
			_withdrawalsEnabled = true;
			emit WithdrawalsEnabled(msg.sender);
			return true;
		}
		return false;
	}
	
	function disableWithdrawals() public onlyAdmin returns (bool) {
		if (_withdrawalsEnabled) {
			_withdrawalsEnabled = false;
			emit WithdrawalsDisabled(msg.sender);
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
	
	
	
	function isAdmin(address _account) public view returns (bool) {
		 return (admins[_account] == true);
	}
	
	function addAdmin(address _account) public onlyAdmin {
		require(!admins[_account], "Admin already added");
		admins[_account] = true;
		emit AdminAdded(msg.sender, _account);
    }
	
	//---
	// custom function added
	function removeAdmin(address _account) public onlyOwner {
		require(_account != owner, "Owner can not remove his admin role");
		require(admins[_account], "Remove admin only");
        admins[_account] = false;
        emit AdminRemoved(msg.sender, _account);
    }
	//---
	
    function renounceAdmin() public {
		require(msg.sender != owner, "Owner can not renounce to his admin role");
		require(admins[msg.sender], "Renounce admin only");
		admins[msg.sender] = false;
		emit AdminRenounced(msg.sender);
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
	 * @return bool.
	 */
	function enableKYC() public onlyAdmin returns (bool success) {
		if (!kycEnabled) {
			kycEnabled = true;
			emit KYCEnabled(msg.sender);
			return true;
		}
		return false;
	}
	
	function disableKYC() public onlyAdmin returns (bool success) {
		if (kycEnabled) {
			kycEnabled = false;
			emit KYCDisabled(msg.sender);
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