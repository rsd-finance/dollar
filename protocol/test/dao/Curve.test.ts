import { ethers, waffle } from "hardhat";
import { expectBNEq, expectRevert, BN } from "../Utils";

import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import MockCurveArtifact from "../../artifacts/contracts/mock/MockCurve.sol/MockCurve.json";
import { MockCurve } from "../../typechain/MockCurve";
const { deployContract } = waffle;

describe("Curve", function () {
  let [owner]: SignerWithAddress[] = [];

  let curve: Contract;

  before(async function () {
    [owner] = await ethers.getSigners();
  });

  beforeEach(async function () {
    curve = (await deployContract(owner, MockCurveArtifact, [])) as MockCurve;
  });

  describe("amount is zero below threshold", function () {
    it("reverts", async function () {
      expectBNEq(await curve.calculateCouponsE(100000, 10000, 0), BN(0));
    });
  });

  describe("amount is zero above threshold", function () {
    it("reverts", async function () {
      expectBNEq(await curve.calculateCouponsE(100000, 50000, 0), BN(0));
    });
  });

  describe("total supply is zero", function () {
    it("reverts", async function () {
      await expectRevert(curve.calculateCouponsE(0, 0, 0), "division by zero");
    });
  });

  describe("amount larger than total supply", function () {
    it("reverts", async function () {
      await expectRevert(curve.calculateCouponsE(100, 50, 110), "subtraction overflow");
    });
  });

  describe("amount larger than total debt", function () {
    it("reverts", async function () {
      await expectRevert(curve.calculateCouponsE(100, 50, 60), "subtraction overflow");
    });
  });

  describe("5-100-5: 0.26315 - not enough to round to unit", function () {
    it("returns correct amount", async function () {
      expectBNEq(await curve.calculateCouponsE(100, 5, 5), BN(0));
    });
  });

  describe("100000-5000-5000: 263.15 - should add 263", function () {
    it("returns correct amount", async function () {
      expectBNEq(await curve.calculateCouponsE(100000, 5000, 5000), BN(263));
    });
  });

  describe("100000-10000-5000: 864.19 - should add 864", function () {
    it("returns correct amount", async function () {
      expectBNEq(await curve.calculateCouponsE(100000, 10000, 5000), BN(864));
    });
  });

  describe("100000-70000-10000: 0.384083 (above threshold) - should add 5625", function () {
    it("returns correct amount", async function () {
      expectBNEq(await curve.calculateCouponsE(100000, 70000, 10000), BN(5625));
    });
  });

  /* 60000/100000 -> 5000/45000
   * 0.6 -> 1/9
   * 0.6 - 0.15 (above threshold) + 1/9 - 0.15 (below threshold)
   * (0.45 * 0.384083 + (0.15-1/9) * 0.323529) / (0.6-1/9) = 0.379266
   */
  describe("100000-60000-55000: 29374 (above and below threshold) - should add 29374", function () {
    it("returns correct amount", async function () {
      expectBNEq(await curve.calculateCouponsE(100000, 60000, 55000), BN(29374));
    });
  });
});
