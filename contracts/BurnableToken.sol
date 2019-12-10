pragma solidity ^0.4.24;

import "./ERC20Token.sol";

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