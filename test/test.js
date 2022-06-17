const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Contract test", function () {
    let cbNFT2, cbNFT1;
    let deployer, alice;

    before("Deploy contracts", async function() {
        [deployer, alice] = await ethers.getSigners();

        const CBNFT1 = await ethers.getContractFactory("CBNFT1");
        cbNFT1 = await CBNFT1.deploy("");
        await cbNFT1.deployed();
        console.log(`CBNFT1 address is: ${cbNFT1.address}`);

        const CBNFT2 = await ethers.getContractFactory("CBNFT2");
        cbNFT2 = await CBNFT2.deploy("");
        await cbNFT2.deployed();
        console.log(`CBNFT2 address is: ${cbNFT2.address}`);
    });

    it("testing here", async function() {
        // mint nft to user
        await cbNFT1.connect(alice).claim({value: ethers.utils.parseUnits("0.01")});
        // check alice's nft1 balance
        let aliceBalance = await cbNFT1.balanceOf(alice.address);
        expect(aliceBalance).to.eq(1);

        // check nft1 tokenid=1 owner
        let nft1Owner = await cbNFT1.ownerOf(1);
        expect(nft1Owner).to.eq(alice.address);

        // set swappable contract
        await cbNFT2.connect(deployer).setSwappableContract(cbNFT1.address);

        // claim nft2 to alice
        await cbNFT1.connect(alice).approve(cbNFT2.address, 1);
        await cbNFT2.connect(alice).claim(cbNFT1.address, 1);

        // await cbNFT2.approve(cbNFT2.address, 1);
        let nft2Owner = await cbNFT2.ownerOf(1);
        expect(nft2Owner).to.eq(alice.address);

        await cbNFT2.connect(alice).swapBack(cbNFT1.address, 1, 1);

        // check nft1 owner, this should be alice
        nft1Owner = await cbNFT1.ownerOf(1);
        expect(nft1Owner).to.eq(alice.address);
        
        // check nft2 owner, this should be nft2 contract
        nft2Owner = await cbNFT2.ownerOf(1);
        expect(nft2Owner).to.eq(cbNFT2.address);
    })
});