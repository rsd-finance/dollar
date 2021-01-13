import { ethers, waffle } from "hardhat";
import { expectEventIn } from "../Utils";

import { Contract, ContractReceipt } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import MockUpgradeableArtifact from "../../artifacts/contracts/mock/MockUpgradeable.sol/MockUpgradeable.json";
import MockImplAArtifact from "../../artifacts/contracts/mock/MockImplA.sol/MockImplA.json";
import MockImplBArtifact from "../../artifacts/contracts/mock/MockImplB.sol/MockImplB.json";
import { MockUpgradeable } from "../../typechain/MockUpgradeable";
import { MockImplA } from "../../typechain/MockImplA";
import { MockImplB } from "../../typechain/MockImplB";

const { deployContract } = waffle;

import { expect } from "chai";
describe("Upgradeable", function () {
  let owner: SignerWithAddress;

  let upgradeable: Contract;
  let implA: Contract;
  let implB: Contract;

  before(async function () {
    [owner] = await ethers.getSigners();
  });

  beforeEach(async function () {
    upgradeable = (await deployContract(owner, MockUpgradeableArtifact, [])) as MockUpgradeable;
    implA = (await deployContract(owner, MockImplAArtifact, [])) as MockImplA;
    implB = (await deployContract(owner, MockImplBArtifact, [])) as MockImplB;
  });

  describe("set initial implementation", function () {
    let txRecp: ContractReceipt;

    beforeEach(async function () {
      const tx = await upgradeable.upgradeToE(implA.address);
      txRecp = await tx.wait();
    });

    it("sets implementation correctly", async function () {
      expect(await upgradeable.implementation()).to.be.equal(implA.address);
      expect(await upgradeable.isInitialized(implA.address)).to.be.equal(true);
    });

    it("emits MockInitializedA event", async function () {
      expectEventIn(txRecp, "Upgraded", {});
    });

    it("emits Upgraded event", async function () {
      await expectEventIn(txRecp, "Upgraded", {
        implementation: implA.address,
      });
    });
  });

  describe("upgrades after initial implementation", function () {
    let txRecp: ContractReceipt;
    beforeEach(async function () {
      await upgradeable.upgradeToE(implA.address);
      const tx = await upgradeable.upgradeToE(implB.address);
      txRecp = await tx.wait();
    });

    it("sets implementation correctly", async function () {
      expect(await upgradeable.implementation()).to.be.equal(implB.address);
      expect(await upgradeable.isInitialized(implB.address)).to.be.equal(true);
    });

    it("emits MockInitializedA event", async function () {
      await expectEventIn(txRecp, "Upgraded", {});
    });

    it("emits Upgraded event", async function () {
      await expectEventIn(txRecp, "Upgraded", {
        implementation: implB.address,
      });
    });
  });
});
