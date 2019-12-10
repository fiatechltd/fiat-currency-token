pragma solidity ^0.4.24;

import "./IConfigLibEvents.sol";
import "./IAdmin.sol";

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