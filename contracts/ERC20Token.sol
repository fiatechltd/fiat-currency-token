pragma solidity ^0.4.24;

import "./libs/SafeMathLib.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IERC20LibEvents.sol";
import "./Owned.sol";
import "./Mortal.sol";



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