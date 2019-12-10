pragma solidity ^0.4.24;

import "./libs/SafeMathLib.sol";
import "./Owned.sol";
import "./Mortal.sol";
import "./interfaces/ITokensRecovery.sol";
import "./interfaces/IEtherReclaimer.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IConfig.sol";
import "./interfaces/IFees.sol";
import "./interfaces/IFiatToken.sol";

import "./ERC20Token.sol";
import "./MintableToken.sol";
import "./BurnableToken.sol";
import "./HasConfig.sol";
import "./HasFees.sol";




/**
 * @dev ERC20 Token, with symbol, name, standard and decimals among others.
 * Token units in this contract mean cents or pennies of the fiat currency it represents.
 */
contract FiatToken is IERC20
		, IFiatToken
		, Owned
		, Mortal
		, ERC20Token
		, MintableToken
		, BurnableToken
		, ITokensRecovery
		, IEtherReclaimer
		, HasConfig
		, HasFees
{
    using SafeMathLib for uint;
	
	
	
    /**
	 * @dev Constructor
	 */
    constructor(address _config, address _fees)
		Owned()
		HasConfig(_config)
		HasFees(_fees)
		ERC20Token(0) // initial supply is zero
		public
	{
    }
	
	
	
    /**
	 * @dev Transfer the balance from token owner's account to `to` account
	 * - Owner's account must have sufficient balance to transfer
	 * - 0 value transfers are allowed
	 * @param to Address to transfer tokens to
	 * @param tokens Amount of tokens to tranfer
	 * @return bool
	 */
    function transfer(address to, uint tokens) public returns (bool)
	{
		if (to == address(0)) return false; //transfers to zero address are forbidden
		require(config.canTransfer(msg.sender, to));
		
		// transfers to your own address are considered withdrawals (so they are allowed) ???
		if (to == msg.sender && config.transferToYourselfIsWidrawal()) {
			return withdrawRequest(tokens);
		}
		
		//calculate transfer fees amount
		//uint transfer_fee_amount = calculateTransferFee(tokens);
		uint transfer_fee_amount = transferFees.calculateFee(tokens);
		
		//transfers involving admin wallets carry zero fees
		if (config.isNoFeeAddress2(msg.sender, to))
			transfer_fee_amount = 0;
		
		require(super.balanceOf(msg.sender) >= (tokens.add(transfer_fee_amount))); ///, "Not enough tokens in sender's balance!");
		
        bool ok1 = super.transfer(to, tokens);
		
		//collect the transfer fees, if wallet is zero/invalid, contract owner gets the transfer fees
		address feesCollector = (config.feesCollectorWallet() == address(0)) ? owner : config.feesCollectorWallet();
		
		bool ok2 = super.transfer(feesCollector, transfer_fee_amount);
        bool ok = (ok1 && ok2);
		require(ok, "transfer failed");
		
		// emit event for transfer fees collected, giving sender address, receiver address, amount sent, fee amount collected and current symbol.
		emit TransferFeesCollected(msg.sender, to, tokens, feesCollector, transfer_fee_amount);
		
        return ok;
    }
	
	
	
    /**
	 * @dev Token owner can approve for `spender` to transferFrom(...) `tokens`
	 * from the token owner's account
	 *
	 * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
	 * https://eips.ethereum.org/EIPS/eip-20
	 * recommends that there are no checks for the approval double-spend attack
	 * as this should be implemented in user interfaces
	 * @param spender Spender address user approves to spend tokens on his behalf
	 * @param tokens Amount of tokens spender is approved to spend/transfer
	 * @return bool
	 */
    function approve(address spender, uint tokens) public returns (bool)
	{
		require(config.canApprove(msg.sender, spender));
		return super.approve(spender, tokens);
    }



    /**
	 * @dev Transfer `tokens` from the `from` account to the `to` account
	 *
	 * The calling account must already have sufficient tokens approve(...)-d
	 * for spending from the `from` account and
	 * - From account must have sufficient balance to transfer
	 * - Spender must have sufficient allowance to transfer
	 * - 0 value transfers are allowed
	 * *** The user executing the function pays the transfer fees, not the funds owner
	 * @param from Address approved spender tranfers tokens from
	 * @param to Address approved spender tranfers to
	 * @param tokens Amount of tokens approved to transfer
	 * @return bool
	 */
    function transferFrom(address from, address to, uint tokens) public returns (bool)
	{
		if (to == address(0)) return false;
		require(config.canTransferFrom(msg.sender, from, to));
		
		//calculate transfer fees amount
		uint transfer_fee_amount = transferFees.calculateFee(tokens);
		
		//transfers involving admin wallets carry zero fees
		if (config.isNoFeeAddress3(msg.sender, from, to))
			transfer_fee_amount = 0;
		
		uint _tokensWithFee = tokens.add(transfer_fee_amount);
		require ((super.balanceOf(from) >= _tokensWithFee) && (super.allowance(from, msg.sender) >= _tokensWithFee));
		
		bool ok1 = super.transferFrom(from, to, tokens);
		
		//collect the transfer fees, if wallet is zero/invalid, contract owner gets the transfer fees
		address feesCollector = (config.feesCollectorWallet() == address(0)) ? owner : config.feesCollectorWallet();
		
		bool ok2 = super.transferFrom(from, feesCollector, transfer_fee_amount);
		require(ok1 && ok2, "transferFrom failed");
		
		bool ok = (ok1 && ok2);
		if (ok) {
			// emit event for transfer fees collected, giving sender address, receiver address, amount sent, fee amount collected and current symbol.
			emit TransferFeesCollected(from, to, tokens, feesCollector, transfer_fee_amount);
		}
		
		return ok;
    }



    /**
	 * @dev Returns the amount of tokens approved by the owner that can be
	 * transferred to the spender's account
	 * @param tokenOwner Address of token owner we check for allowance on
	 * @param spender Address of spender that token owner approved to spend on his behalf
	 * @return uint
	 */
    function allowance(address tokenOwner, address spender) public view returns (uint remaining) {
		return super.allowance(tokenOwner, spender);
    }
	
	
	
	///*** BlockchainBridge contract functions
	
	/**
	 * @dev Function executed by admin, after funds were received by bank wire or any other accepted method, admin deposits equal tokens to user address.
	 * @param _to User address to deposit tokens to
	 * @param _amount Amount of tokens to deposit to user address
	 * @return bool
	 */
	function depositAccept(address _to, uint _amount) public returns (bool)
	{
		require(config.canDeposit(msg.sender, _to), "canDeposit");
		
		// create tokens as they were deposited as reserves
		require(super.mint(_to, _amount), "mint failed");
		//emit DepositAccepted event
		emit DepositAccepted(msg.sender, _to, _amount);
		return true;
    }
	
	
	
	/**
	 * @dev Function executed by user asking for a withdrawal, withdrawal fee (if any) is substracted from withdrawal amount
	 * e.g. if user withdraws $1000 he pays $1 from that amount as fee (for withdrawal fee = 0.1%)
	 * @param _amount Amount of tokens to withdraw
	 * @return bool
	 */
	function withdrawRequest(uint _amount) public returns (bool)
	{
		require((_amount > 0 && _amount <= super.balanceOf(msg.sender)) && (_amount >= config.minWithdrawalAmount())
			&& (config.maxWithdrawalAmount() == 0 || _amount <= config.maxWithdrawalAmount()));
		require(config.canWithdraw(msg.sender));
		
		// destroy tokens as they were withdrawn
		require(super.burn(msg.sender, _amount), "burn failed");
		// emit event for withdrawal.
		emit WithdrawalRequested(msg.sender, _amount, 0 /*zero withdrawal fee*/);
		return true;
	}
	
	///*** BlockchainBridge contract functions
	
	
	
	///*** BlacklistOperations contract functions
	
	function wipeoutAddressBalance(address _account) public returns (bool)
	{
		require(config.canWipeoutAddressBalance(msg.sender, _account), "canWipeoutAddressBalance failed");
		
		uint _amount = super.balanceOf(_account);
		balances[_account] = 0;
		// substract amount from total supply
		_totalSupply = _totalSupply.sub(_amount);
		emit Transfer(_account, address(0), _amount);
		emit WipeoutBlacklistedAddress(msg.sender, _account, _amount);
		return true;
	}
	
	///*** BlacklistOperations contract functions
	
	
	
    /**
	 * Accept ETH donations
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
	
	
	
    /**
	 * @dev Owner can transfer out any accidentally sent ERC20 tokens
	 * @param tokenAddress Token contract address we want to recover lost tokens from.
	 * @param tokens Amount of tokens to be recovered, usually the same as the balance of this contract.
	 * @return bool
	 */
    function recoverAnyERC20Token(address tokenAddress, uint tokens) external onlyOwner returns (bool ok) {
		ok = IERC20(tokenAddress).transfer(owner, tokens);
    }

}