
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

// File: contracts\interfaces\ITokensRecovery.sol

pragma solidity ^0.4.24;



/**
 * @dev ITokensRecovery interface protocol used by admin to recover other tokens mistakenly deposited to the contract implementing this interface.
 */
interface ITokensRecovery {
	
	///**
	// * @dev Event raised when foreign tokens were claimed/recovered from mistakenly transfer operation to contract address implementing this interface.
	// * @param tokenAddress Lost foreign tokens contract address
	// * @param fromContractAddress Contract address that was mistakenly sent tokens and is about to recover them
	// * @param to Address we send lost tokens to
	// * @param tokens Amount of tokens to recover
	// */
	//event ERC20TokenRecovered(address indexed tokenAddress, address indexed fromContractAddress, address indexed to, uint tokens);
	
	
	
	/**
	 * @dev Recover mistakenly sent other contract tokens to this contract address by executing foreign contract transfer function from this contract.
	 * @param tokenAddress Foreign token contract address to recover tokens of.
	 * @param tokens Tokens to recover.
	 * @return bool.
	 */
	function recoverAnyERC20Token(address tokenAddress, uint tokens) external returns (bool success);
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

// File: contracts\interfaces\IERC20LibEvents.sol

pragma solidity ^0.4.24;

/**
 * @dev ERC20 library events interface.
 */
interface IERC20LibEvents
{
	event Transfer(address indexed from, address indexed to, uint tokens);
	event Approval(address indexed owner, address indexed spender, uint tokens);
}

// File: contracts\interfaces\IERC20.sol

pragma solidity ^0.4.24;



/**
 * @dev ERC20 library contract interface.
 */
contract IERC20 is IERC20LibEvents
{
	function totalSupply() public view returns (uint);
	
	function transfer(address _to, uint _value) public returns (bool success);
	
	function transferFrom(address _from, address _to, uint _value) public returns (bool success);
	
	function balanceOf(address _owner) public view returns (uint balance);
	
	function approve(address _spender, uint _value) public returns (bool success);
	
	function allowance(address _owner, address _spender) public view returns (uint remaining);
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

// File: contracts\interfaces\IFeesLibEvents.sol

pragma solidity ^0.4.24;

/**
 * @dev Interface for fees library with events.
 */
interface IFeesLibEvents {
	
	/**
	 * @dev Event raised when fees are enabled.
	 */
	event FeesEnabled(address indexed admin);
	
	/**
	 * @dev Event raised when fees are disabled.
	 */
	event FeesDisabled(address indexed admin);
	
	/**
	 * @dev Event raised when percent fees are changed.
	 */
	event FeesChanged(address indexed admin, uint parts_Fee, uint perX_Fee);
	
	/**
	 * @dev Event raised when minimum fees are changed.
	 */
	event MinFeesChanged(address indexed admin, uint minFee);
	
	/**
	 * @dev Event raised when maximum fees are changed.
	 */
	event MaxFeesChanged(address indexed admin, uint maxFee);
}

// File: contracts\interfaces\IFees.sol

pragma solidity ^0.4.24;



/**
 * @dev Interface for contract fees library.
 */
contract IFees is IFeesLibEvents
{
	/**
	 * @dev Init fees
	 * @param parts_Fee Numerator part of the percentage fee.
	 * @param perX_Fee Denominator part of the percentage fee.
	 * @param min_Fee_tokens Minimum fee limit.
	 * @param max_Fee_tokens Maximum fee limit.
	 * @param fee_Enabled Enable/disable fees toggle.
	 * @return bool
	 */
	function init(uint parts_Fee, uint perX_Fee, uint min_Fee_tokens, uint max_Fee_tokens, bool fee_Enabled) public returns (bool);
	
	/**
	 * @dev calculateFee, given token amount, calculate transfer fee in units/tokens that are cents or pennies
	 * @param tokens Tokens amount to calculate fees for
	 * @return uint
	 */
	function calculateFee(uint tokens) public view returns (uint fee);
	
	
	
	/**
	 * @dev Get minimum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMinFee() public view returns (uint);
	
	/**
	 * @dev Get maximum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMaxFee() public view returns (uint);
	
	
	
	/**
	 * @dev Change minimum fee tokens/pennies/cents
	 * @param newMinFee Minimum amount of tokens to be set as minimum
	 * @return bool
	 */
	function setMinFee(uint newMinFee) public returns (bool);
	
	/**
	 * @dev Change maximum fee tokens/pennies/cents
	 * @param newMaxFee Maximum amount of tokens to be set as maximum
	 * @return bool
	 */
	function setMaxFee(uint newMaxFee) public returns (bool);
	
	
	
	/**
	 * @dev Check enabled/disabled fees
	 * @return bool
	 */
	function feesEnabled() public view returns (bool);
	
	/**
	 * @dev Enable/Disable fees
	 * @return bool
	 */
	function enableFees(bool enable) public returns (bool);
	
	
	
	/**
	 * @dev Get fees as parts per X units
	 * @return bool
	 */
	function getFeesNumerator() public view returns (uint _parts_Fee);
	
	/**
	 * @dev Get fees as parts per X units
	 * @return bool
	 */
	function getFeesDenominator() public view returns (uint _perX_Fee);
	
	/**
	 * @dev Set fees as parts per X units
	 * @param _parts_Fee Parts component of the fee percentage
	 * @param _perX_Fee Per X component of the fee percentage
	 * @return bool
	 */
	function setFees(uint _parts_Fee, uint _perX_Fee) public returns (bool);
}

// File: contracts\interfaces\IFiatToken.sol

pragma solidity ^0.4.24;



/**
 * @dev Fiat Token contract interface.
 */
contract IFiatToken is IERC20
{
	/**
	 * @dev Event raised when transfer fee was collected.
	 * @param from User address the transfer amount was taken from.
	 * @param to User address the transfer amount was sent to.
	 * @param transferTokens Transfer tokens amount.
	 * @param feesCollector Address that collected fee goes to.
	 * @param transferTokensFee Transfer tokens fee amount in tokens.
	 */
	event TransferFeesCollected(address indexed from, address indexed to, uint transferTokens, address indexed feesCollector, uint transferTokensFee);
	
	/**
	 * @dev Event raised when user address has been deposited tokens.
	 * @param _admin Admin address performing the operation.
	 * @param _to User address to deposit tokens to.
	 * @param _amount Deposit tokens amount.
	 */
	event DepositAccepted(address indexed _admin, address indexed _to, uint _amount);
	
	/**
	 * @dev Event raised when user asked for withdrawal.
	 * @param _from User address asking for withdrawal.
	 * @param _amount Withdrawal tokens amount.
	 * @param _withdrawalTokensFee Withdrawal fee in tokens if any.
	 */
	event WithdrawalRequested(address indexed _from, uint _amount, uint _withdrawalTokensFee);
	
	/**
	 * @dev Event raised when admin wiped out user address balance.
	 * @param _admin Admin address performing the operation.
	 * @param _account User address wiped out.
	 * @param _value User address latest balance available just before the wipe out.
	 */
	event WipeoutBlacklistedAddress(address indexed _admin, address indexed _account, uint _value);
	
	
	
	/**
	 * @dev Credit user balance with given tokens amount, only admin can do it.
	 * @param _to User address to deposit tokens to.
	 * @param _amount Tokens to deposit.
	 * @return bool If success returns true, false otherwise.
	 */
	function depositAccept(address _to, uint _amount) public returns (bool success);
	
	/**
	 * @dev User withdraws tokens.
	 * @param _amount Tokens to withdraw.
	 * @return bool If success returns true, false otherwise.
	 */
	function withdrawRequest(uint _amount) public returns (bool success);
	
	/**
	 * @dev Wipe out blacklisted user address, only admin can do it.
	 * @param _account User address.
	 * @return bool If success returns true, false otherwise.
	 */
	function wipeoutAddressBalance(address _account) public returns (bool success);
}

// File: contracts\ERC20Token.sol

pragma solidity ^0.4.24;



/**
 * @dev ERC20 token contract encapsulating generic token functionality.
 */
contract ERC20Token is IERC20LibEvents
	, IERC20
	, Owned
	, Mortal
{
	using SafeMathLib for uint;
	
	mapping (address => uint) internal balances;
	mapping (address => mapping (address => uint)) internal allowances;
	uint internal _totalSupply;
	
	
	
	constructor(uint _initial_supply) internal {
		_totalSupply = _initial_supply;
		balances[msg.sender] = _initial_supply;
	}
	
	function totalSupply() public view returns (uint) {
		return _totalSupply;
	}
	
	/**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
	function transfer(address recipient, uint amount) public returns (bool success) {
		_transfer(msg.sender, recipient, amount);
		return true;
	}
	
	/**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20};
     *
     * Requirements:
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for `sender`'s tokens of at least
     * `amount`.
     */
	function transferFrom(address sender, address recipient, uint amount) public returns (bool success) {
		_transfer(sender, recipient, amount);
        _approve(sender, msg.sender, allowances[sender][msg.sender].sub(amount));
		return true;
	}
	
	function balanceOf(address _owner) public view returns (uint balance) {
		return balances[_owner];
	}
	
	function approve(address _spender, uint _amount) public returns (bool success) {
		_approve(msg.sender, _spender, _amount);
		return true;
	}
	
	function allowance(address _owner, address _spender) public view returns (uint remaining) {
		return allowances[_owner][_spender];
	}
	
	/**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(msg.sender, spender, allowances[msg.sender][spender].add(addedValue));
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        _approve(msg.sender, spender, allowances[msg.sender][spender].sub(subtractedValue));
        return true;
    }
	
	/**
     * @dev Moves tokens `amount` from `sender` to `recipient`.
     *
     * This is internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `sender` cannot be the zero address.
     * - `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        balances[sender] = balances[sender].sub(amount);
        balances[recipient] = balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }
	
	/**
     * @dev Sets `_amount` as the allowance of `_spender` over the `owner`s tokens.
     *
     * This is internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `_owner` cannot be the zero address.
     * - `_spender` cannot be the zero address.
     */
    function _approve(address _owner, address _spender, uint256 _amount) internal {
        require(_owner != address(0), "ERC20: approve from the zero address");
        require(_spender != address(0), "ERC20: approve to the zero address");

        allowances[_owner][_spender] = _amount;
        emit Approval(_owner, _spender, _amount);
    }
}

// File: contracts\MintableToken.sol

pragma solidity ^0.4.24;

/**
 * @dev Mintable token contract.
 */
contract MintableToken is ERC20Token
{
	/**
	 * @dev Mint tokens to given address.
	 * @param _to Address to mint tokens to.
	 * @param _value Amount of tokens to mint.
	 * @return bool
	 */
	function mint(address _to, uint _value) internal returns (bool success) {
		balances[_to] = balances[_to].add(_value);
		_totalSupply = _totalSupply.add(_value);
		emit Transfer(address(0), _to, _value);
		return true;
	}
}

// File: contracts\BurnableToken.sol

pragma solidity ^0.4.24;

/**
 * @dev Burnable token contract.
 */
contract BurnableToken is ERC20Token
{
	/**
	 * @dev Burn amount from given address.
	 * @param _from Address to burn tokens from.
	 * @param _value Amount of tokens to burn.
	 * @return bool
	 */
	function burn(address _from, uint _value) internal returns (bool success) {
		balances[_from] = balances[_from].sub(_value);
		_totalSupply = _totalSupply.sub(_value);
		emit Transfer(_from, address(0), _value);
		return true;
	}
}

// File: contracts\HasConfig.sol

pragma solidity ^0.4.24;

/**
 * @dev Base contract for config contract as external contract usage.
 */
contract HasConfig is Owned
{
	IConfig public config;
	
	/**
	 * @dev Constructor
	 */
    constructor(address _config) internal {
		setIConfig(_config);
    }
	
	modifier onlyAdmin {
		require(config.isAdmin(msg.sender), "Admin required");
		_;
	}
	
	function setIConfig(address _config) public onlyOwner {
		config = IConfig(_config);
	}
}

// File: contracts\HasFees.sol

pragma solidity ^0.4.24;



/**
 * @dev Base contract for config contract as external contract usage.
 */
contract HasFees is Owned
{
	IFees public transferFees;
	
	/**
	 * @dev Constructor
	 */
    constructor(address _fees) internal {
		setIFees(_fees);
    }
	
	function setIFees(address _fees) public onlyOwner {
		transferFees = IFees(_fees);
	}
}

// File: contracts\FiatToken.sol

pragma solidity ^0.4.24;




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

// File: contracts\USDf.sol

pragma solidity ^0.4.24;



/**
 * @dev Top-level ERC20 compliant USD fiat currency token, with symbol, name, version and decimals among others.
 * Token units in this contract mean cents or pennies of the fiat currency it represents.
 */
contract USDf is FiatToken
{
	/**
	 * @dev Constructor
	 */
    constructor(address _config, address _fees)
		FiatToken(_config, _fees)
		public
	{
    }
	
	function decimals() public pure returns (uint8) {
        return 2;
    }

    function name() public pure returns (string) {
        return "USD fiat token";
    }

    function symbol() public pure returns (string) {
        return "USDf";
    }
	
	function version() public pure returns (string) {
        return "v1.0";
    }
}
