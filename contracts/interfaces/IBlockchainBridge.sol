pragma solidity ^0.4.24;



/**
 * @dev IBlockchainBridge interface protocol used by users and system admin to Deposit and Withdrawal funds to and from blockchain.
 */
interface IBlockchainBridge {
	
	/**
	 * @dev Event is raised after Fiatech reviewed deposit request and has got the funds from user's bank account
	 * and credits his wallet with equivalent currency token.
	 * @param _admin Admin address depositing funds into user wallet address.
	 * @param _to User address admin deposits funds to.
	 * @param _amount Deposit amount.
	 */
	event DepositAccepted(address indexed _admin, address indexed _to, uint _amount);
	
	/**
	 * @dev Event is raised when user asks for a withdrawal and request is pending for review.
	 * @param _from User address asking for withdrawal.
	 * @param _amount Withdrawal amount.
	 * @param _withdrawalTokensFee Withdrawal fee amount of tokens collected, if any, zero when they are disabled.
	 */
	event WithdrawalRequested(address indexed _from, uint _amount, uint _withdrawalTokensFee);
	
	
	
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
	 * @dev Enable deposits if they are disabled, executed only by admin.
	 * Emits DepositsEnabled event.
	 * @return bool.
	 */
	function enableDeposits() external returns (bool);
	
	/**
	 * @dev Disable deposits if they are enabled, executed only by admin.
	 * Emits DepositsDisabled event.
	 * @return bool.
	 */
	function disableDeposits() external returns (bool);
	
	/**
	 * @dev Enable withdrawals if they are disabled, executed only by admin.
	 * Emits WithdrawalsEnabled event.
	 * @return bool.
	 */
	function enableWithdrawals() external returns (bool);
	
	/**
	 * @dev Disable withdrawals if they are enabled, executed only by admin.
	 * Emits WithdrawalsDisabled event.
	 * @return bool.
	 */
	function disableWithdrawals() external returns (bool);
	
	
	
	/**
	 * @dev Executed by admin to credit user wallet with fiat currency he deposited via bank wire or any other method.
	 * @param _to User address to give deposited funds to.
	 * @param _amount Deposit amount.
	 * @return bool
	 */
	function depositAccept(address _to, uint _amount) external returns (bool);
	
	/**
	 * @dev Eexecuted by user asking for a withdrawal.
	 * @param _amount Amount to withdraw.
	 * @return bool.
	 */
	function withdrawRequest(uint _amount) external returns (bool);
}
