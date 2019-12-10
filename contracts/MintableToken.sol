pragma solidity ^0.4.24;

import "./ERC20Token.sol";

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