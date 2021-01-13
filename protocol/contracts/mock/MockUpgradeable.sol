/*
    Copyright 2021 Real Stable Dollar <realstabledollar@gmail.com>

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "../dao/Upgradeable.sol";
import "../dao/Permission.sol";

contract MockUpgradeable is Upgradeable, Permission {
    constructor() public {}

    function initialize() public {
        revert("Should not call");
    }

    function upgradeToE(address newImplementation) external {
        super.upgradeTo(newImplementation);
    }
}
