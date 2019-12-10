
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

// File: contracts\libs\FeesLib.sol

pragma solidity ^0.4.24;

/**
 * @title FeesLib
 * @dev Library for managing fees on any contract, it handles fees percentages with minimum and maximum amount,
 * on eth blockchain having parts per X as percentage storing the two parts of the fraction.
 */
library FeesLib {
	
	using SafeMathLib for uint;
	
	// fee as parts per X units, e.g. 2 per 1000 = 0.2%
    struct FeeStorage {
		// e.g. 0.1% => [1] per 1000, this is 1
		uint parts_Fee;
		
		// e.g. 0.1% => 1 per [1000], this is 1000
		uint perX_Fee;
		
		// minimum fee in tokens that are the minimum unit number in smart contract
		uint min_Fee;
		
		// maximum fee in tokens that are the maximum unit number in smart contract, if zero is disabled
		uint max_Fee;
		
		// fees enabled/disabled
		bool feesEnabled;
    }
	
	
	
	/**
	 * @dev initTransferFees, given all required parameters in the same order as they are declared in the FeeStorage struct.
	 * @param _parts_Fee Parts component of the fee percentage
	 * @param _perX_Fee Per X component of the fee percentage
	 * @param _min_Fee Mininmum amount of tokens for the fee
	 * @param _max_Fee Maximum amount of tokens for the fee, zero means no maximum
	 * @param _feesEnabled Are fees enables?
	 * @return bool
	 */
	function init(FeeStorage storage self, uint _parts_Fee, uint _perX_Fee, uint _min_Fee, uint _max_Fee, bool _feesEnabled) internal returns (bool) {
		if (self.parts_Fee != _parts_Fee)
			self.parts_Fee = _parts_Fee;
		if (self.perX_Fee != _perX_Fee)
			self.perX_Fee = _perX_Fee;
		if (self.min_Fee != _min_Fee)
			self.min_Fee = _min_Fee;
		if (self.max_Fee != _max_Fee)
			self.max_Fee = _max_Fee;
		if (self.feesEnabled != _feesEnabled)
			self.feesEnabled = _feesEnabled;
		return true;
	}
	
	
	
	/**
	 * @dev CalculateFee, given token amount, calculate transfer fee in units/tokens that are cents or pennies
	 * @param tokens Tokens amount to calculate fees for
	 * @return uint
	 */
	function calculateFee(FeeStorage storage self, uint tokens) internal view returns (uint fee) {
		if (!self.feesEnabled)
			return 0;
		
		fee = tokens.percent(self.parts_Fee, self.perX_Fee);
		
		//filter fee to minimum amount of tokens/pennies allowed
		if (self.feesEnabled && fee < self.min_Fee) {
			fee = self.min_Fee;
		}
		
		//filter fee to maximum amount of tokens/pennies allowed if greater than zero
		if (self.feesEnabled && self.max_Fee > 0 && fee > self.max_Fee) {
			fee = self.max_Fee;
		}
	}
	
	
	
	/**
	 * @dev Get minimum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMinFee(FeeStorage storage self) internal view returns (uint) {
		return self.min_Fee;
	}
	
	/**
	 * @dev Get maximum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMaxFee(FeeStorage storage self) internal view returns (uint) {
		return self.max_Fee;
	}
	
	
	
	/**
	 * @dev Change minimum fee tokens/pennies/cents
	 * @param newMinFee Minimum amount of tokens to be set as minimum
	 * @return bool
	 */
	function setMinFee(FeeStorage storage self, uint newMinFee) internal returns (bool) {
		if (self.min_Fee != newMinFee) {
			self.min_Fee = newMinFee;
			return true;
		}
		return false;
	}
	
	/**
	 * @dev Change maximum fee tokens/pennies/cents
	 * @param newMaxFee Maximum amount of tokens to be set as maximum
	 * @return bool
	 */
	function setMaxFee(FeeStorage storage self, uint newMaxFee) internal returns (bool) {
		if (self.max_Fee != newMaxFee) {
			self.max_Fee = newMaxFee;
			return true;
		}
		return false;
	}
	
	
	
	/**
	 * @dev Enable/Disable fees
	 * @return bool
	 */
	function enableFees(FeeStorage storage self, bool enable) internal returns (bool) {
		if (self.feesEnabled != enable) {
			self.feesEnabled = enable;
			return true;
		}
		return false;
	}
	
	
	
	/**
	 * @dev Set fees as parts per X units
	 * @param _parts_Fee Parts component of the fee percentage
	 * @param _perX_Fee Per X component of the fee percentage
	 * @return bool
	 */
	function setFees(FeeStorage storage self, uint _parts_Fee, uint _perX_Fee) internal returns (bool) {
		// at least one factor has to be different for change to be allowed, what's the point of setting the same values anyway?
		require(_parts_Fee != self.parts_Fee || _perX_Fee != self.perX_Fee, "FeesLib._setFees: required _parts_Fee != self.parts_Fee || _perX_Fee != self.perX_Fee");
		require(_perX_Fee > 0, "FeesLib._setFees: required _perX_Fee > 0");
		require(_parts_Fee < _perX_Fee, "FeesLib._setFees: required _parts_Fee < _perX_Fee");
		
		self.parts_Fee = _parts_Fee;
		self.perX_Fee = _perX_Fee;
		
		return true;
	}
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

// File: contracts\Fees.sol

pragma solidity ^0.4.24;



/**
 * @title FeesLib
 * @dev Contract library for managing fees on any contract, it handles fees percentages with minimum and maximum amount,
 * on eth blockchain having parts per X as percentage storing the two parts of the fraction.
 */
contract Fees is IFeesLibEvents
	, IFees
	, Owned
	, Mortal
	, EtherReclaimer
	, Named
	, HasAdmin
{
	using SafeMathLib for uint;
	
	using FeesLib for FeesLib.FeeStorage;
	
	FeesLib.FeeStorage fees;
	
	
	
	constructor(address _admins)
		HasAdmin(_admins)
		public
	{
		uint parts_Fee = 1; // 1 per 1000 as 0.1%
		uint perX_Fee = 1000; // 1 per 1000 as 0.1%
		uint min_Fee_tokens = 10; //10 cent(s) as fixed minimum fee
		uint max_Fee_tokens = 0; //0 means disabled fixed maximum fee
		bool fee_Enabled = false;
		fees.init(parts_Fee, perX_Fee, min_Fee_tokens, max_Fee_tokens, fee_Enabled);
	}
	
	/**
	 * @dev initTransferFees, given all required parameters in the same order as they are declared in the Fee struct.
	 * @param _parts_Fee Numerator component of the fee percentage
	 * @param _perX_Fee Denominator component of the fee percentage
	 * @param _min_Fee Mininmum amount of tokens for the fee
	 * @param _max_Fee Maximum amount of tokens for the fee, zero means no maximum
	 * @param _feesEnabled Are fees enables?
	 * @return bool
	 */
	function init(uint _parts_Fee, uint _perX_Fee, uint _min_Fee, uint _max_Fee, bool _feesEnabled) public onlyAdmin returns (bool) {
		return fees.init(_parts_Fee, _perX_Fee, _min_Fee, _max_Fee, _feesEnabled);
	}
	
	
	
	/**
	 * @dev CalculateFee, given token amount, calculate transfer fee in units/tokens that are cents or pennies
	 * @param tokens Tokens amount to calculate fees for
	 * @return uint
	 */
	function calculateFee(uint tokens) public view returns (uint fee) {
		return fees.calculateFee(tokens);
	}
	
	
	
	/**
	 * @dev Get minimum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMinFee() public view returns (uint) {
		return fees.min_Fee;
	}
	
	/**
	 * @dev Get maximum fee tokens/pennies/cents
	 * @return uint
	 */
	function getMaxFee() public view returns (uint) {
		return fees.max_Fee;
	}
	
	
	
	/**
	 * @dev Change minimum fee tokens/pennies/cents
	 * @param newMinFee Minimum amount of tokens to be set as minimum
	 * @return bool
	 */
	function setMinFee(uint newMinFee) public onlyAdmin returns (bool ok) {
		ok = fees.setMinFee(newMinFee);
		if (ok) {
			emit MinFeesChanged(msg.sender, newMinFee);
		}
	}
	
	/**
	 * @dev Change maximum fee tokens/pennies/cents
	 * @param newMaxFee Maximum amount of tokens to be set as maximum
	 * @return bool
	 */
	function setMaxFee(uint newMaxFee) public onlyAdmin returns (bool ok) {
		ok = fees.setMaxFee(newMaxFee);
		if (ok) {
			emit MaxFeesChanged(msg.sender, newMaxFee);
		}
	}
	
	
	
	/**
	 * @dev Check enabled/disabled fees
	 * @return bool
	 */
	function feesEnabled() public view returns (bool) {
		return fees.feesEnabled;
	}
	
	/**
	 * @dev Enable/Disable fees
	 * @return bool
	 */
	function enableFees(bool enable) public onlyAdmin returns (bool ok) {
		ok = fees.enableFees(enable);
		if (ok) {
			if (enable)
				emit FeesEnabled(msg.sender);
			else emit FeesDisabled(msg.sender);
		}
	}
	
	
	
	/**
	 * @dev Get fees as parts per X units
	 * @return bool
	 */
	function getFeesNumerator() public view returns (uint _parts_Fee) {
		_parts_Fee = fees.parts_Fee;
	}
	
	
	/**
	 * @dev Get fees as parts per X units
	 * @return bool
	 */
	function getFeesDenominator() public view returns (uint _perX_Fee) {
		_perX_Fee = fees.perX_Fee;
	}
	
	/**
	 * @dev Set fees as parts per X units
	 * @param _parts_Fee Parts component of the fee percentage
	 * @param _perX_Fee Per X component of the fee percentage
	 * @return bool
	 */
	function setFees(uint _parts_Fee, uint _perX_Fee) public onlyAdmin returns (bool ok) {
		ok = fees.setFees(_parts_Fee, _perX_Fee);
		if (ok) {
			emit FeesChanged(msg.sender, _parts_Fee, _perX_Fee);
		}
	}
}

// File: contracts\USDf_fees.sol

pragma solidity ^0.4.24;

/**
 * @dev Top-level ERC20 compliant USD fiat currency token fees contract.
 */
contract USDf_fees is Fees
{
	/**
	 * @dev Constructor
	 */
    constructor(address _admins)
		Fees(_admins)
		public
	{
		name = "Fiatech USDf fees";
    }
}
