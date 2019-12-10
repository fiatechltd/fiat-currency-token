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