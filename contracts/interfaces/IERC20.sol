pragma solidity ^0.4.24;

import "./IERC20LibEvents.sol";



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