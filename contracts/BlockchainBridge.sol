pragma solidity ^0.4.24;

import "./libs/SafeMathLib.sol";
import "./interfaces/IBlockchainBridge.sol";
import "./HasConfig.sol";

/**
 * @dev BlockchainBridge abstract contract implementing IBlockchainBridge interface protocol used by users and system admin to Deposit and Withdrawal funds to and from blockchain.
 */
contract BlockchainBridge is IBlockchainBridge, HasConfig {
	
	using SafeMathLib for uint;
	
	
	
	// toggle to control deposits
	bool public depositsEnabled;
	
	// toggle to control withdrawals
	bool public withdrawalsEnabled;
	
	// minimum withdrawal amount
	uint public minWithdrawalAmount;
	
	// maximum withdrawal amount, 0 means disabled
	uint public maxWithdrawalAmount;
	
	
	
	event MinWithdrawalAmountChanged(address indexed _admin, uint _minWithdrawalAmount, uint _newMinWithdrawalAmount);
	event MaxWithdrawalAmountChanged(address indexed _admin, uint _maxWithdrawalAmount, uint _newMaxWithdrawalAmount);
	
	
	
	/**
	 * @dev Constructor
	 */
	constructor() internal
	{
        depositsEnabled = true;
		withdrawalsEnabled = true;
		
		//50 usd or equivalent is default withdraw amount
		minWithdrawalAmount = 5000;
		maxWithdrawalAmount = 0; //disabled
    }
	
	
	
	modifier whenDepositsEnabled {
		require(depositsEnabled == true, "Deposits must be enabled!");
		_;
	}
	
	modifier whenWithdrawalsEnabled {
		require(withdrawalsEnabled == true, "Withdrawals must be enabled!");
		_;
	}
	
	
	
	/**
	 * @dev Enable/Disable deposits, executed only by admin.
	 * @return bool
	 */
	function enableDeposits(bool enable) public onlyAdmin returns (bool) {
		if (depositsEnabled != enable) {
			depositsEnabled = enable;
			if (enable)
				emit DepositsEnabled(msg.sender);
			else emit DepositsDisabled(msg.sender);
			return true;
		}
		return false;
	}
	
	///**
	// * @dev Enable deposits if they are disabled, executed only by admin.
	// * @return bool
	// */
	//function enableDeposits() public onlyAdmin returns (bool) {
	//	if (!depositsEnabled) {
	//		depositsEnabled = true;
	//		//emit DepositsEnabled(msg.sender);
	//		return true;
	//	}
	//	return false;
	//}
	
	///**
	// * @dev Disable deposits if they are enabled, executed only by admin.
	// * @return bool
	// */
	//function disableDeposits() public onlyAdmin returns (bool) {
	//	if (depositsEnabled) {
	//		depositsEnabled = false;
	//		//emit DepositsDisabled(msg.sender);
	//		return true;
	//	}
	//	return false;
	//}
	
	
	
	/**
	 * @dev Enable/Disable withdrawals, executed only by admin.
	 * @return bool
	 */
	function enableWithdrawals(bool enable) public onlyAdmin returns (bool) {
		if (withdrawalsEnabled != enable) {
			withdrawalsEnabled = enable;
			if (enable)
				emit WithdrawalsEnabled(msg.sender);
			else emit WithdrawalsDisabled(msg.sender);
			return true;
		}
		return false;
	}
	
	///**
	// * @dev Enable withdrawals if they are disabled, executed only by admin.
	// * @return bool
	// */
	//function enableWithdrawals() public onlyAdmin returns (bool) {
	//	if (!withdrawalsEnabled) {
	//		withdrawalsEnabled = true;
	//		//emit WithdrawalsEnabled(msg.sender);
	//		return true;
	//	}
	//	return false;
	//}
	
	///**
	// * @dev Disable withdrawals if they are enabled, executed only by admin.
	// * @return bool
	// */
	//function disableWithdrawals() public onlyAdmin returns (bool) {
	//	if (withdrawalsEnabled) {
	//		withdrawalsEnabled = false;
	//		//emit WithdrawalsDisabled(msg.sender);
	//		return true;
	//	}
	//	return false;
	//}
	
	
	
	/**
	 * @dev Set/change minimum withdrawal amount, only admin can do it.
	 * @return bool
	 */
	function setMinWithdrawalAmount(uint _minAmount) public onlyAdmin returns (bool) {
		if (_minAmount != minWithdrawalAmount) { //, "Min withdrawal different value required!");
			emit MinWithdrawalAmountChanged(msg.sender, minWithdrawalAmount, _minAmount);
			minWithdrawalAmount = _minAmount;
			return true;
		}
		return false;
	}
	
	/**
	 * @dev Set/change maximum withdrawal amount, only admin can do it.
	 * @return bool
	 */
	function setMaxWithdrawalAmount(uint _maxAmount) public onlyAdmin returns (bool) {
		if (_maxAmount != maxWithdrawalAmount) { //, "Max withdrawal different value required!");
			emit MaxWithdrawalAmountChanged(msg.sender, maxWithdrawalAmount, _maxAmount);
			maxWithdrawalAmount = _maxAmount;
			return true;
		}
		return false;
	}
	
	
	
	//---
	// function executed by admin to credit user wallet with fiat currency he deposited via bank wire or any other method.
	//---
	function depositAccept(address /*_to*/, uint /*_amount*/) public returns (bool) {
		return false;
	}
	
	//---
	// function executed by user asking for a withdrawal
	//---
	function withdrawRequest(uint /*_amount*/) public returns (bool) {
		return false;
	}
}
