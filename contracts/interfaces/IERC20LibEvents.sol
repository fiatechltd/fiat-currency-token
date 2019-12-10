pragma solidity ^0.4.24;

/**
 * @dev ERC20 library events interface.
 */
interface IERC20LibEvents
{
	event Transfer(address indexed from, address indexed to, uint tokens);
	event Approval(address indexed owner, address indexed spender, uint tokens);
}