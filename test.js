const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");

contract("Voting", (accounts) => {
  const owner = accounts[0];
  const second = accounts[1];
  const third = accounts[2];

  let VotingInstance;

  // ----------- Registering voters status ----------------- //

  describe("Registering voters status", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
    });

    // expect

    it("should store voter", async () => {
      await VotingInstance.addVoter(owner, { from: owner });
      const storedData = await VotingInstance.voters(owner);
      expect(storedData.isRegistered).to.be.true;
    });

    it("should show voter in mapping", async () => {
      await VotingInstance.addVoter(second, { from: owner });
      const storedData = await VotingInstance.getVoter(second, {
        from: second,
      });
      expect(storedData.isRegistered).to.be.true;
    });

    it("should start proposals registering", async () => {
      await VotingInstance.startProposalsRegistering({ from: owner });
      expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(
        new BN(1)
      );
    });

    // revert

    it("should revert when storing voters without owner's address", async () => {
      await expectRevert(
        VotingInstance.addVoter(second, { from: second }),
        "Ownable: caller is not the owner"
      );
    });

    it("should revert when proposal submit in a wrong WorkflowStatus", async () => {
      await VotingInstance.addVoter(owner, { from: owner });
      await expectRevert(
        VotingInstance.addProposal("Manger des chips", { from: owner }),
        "Proposals are not allowed yet"
      );
    });

    it("should revert when vote submit in a wrong WorkflowStatus", async () => {
      await VotingInstance.addVoter(owner, { from: owner });
      await expectRevert(
        VotingInstance.setVote(new BN(0), { from: owner }),
        "Voting session havent started yet"
      );
    });

    it("should revert start proposals registering without owner address", async () => {
      await expectRevert(
        VotingInstance.startProposalsRegistering({ from: second }),
        "Ownable: caller is not the owner"
      );
    });

    it("should revert for the end proposals registering status", async () => {
      await expectRevert(
        VotingInstance.endProposalsRegistering({ from: owner }),
        "Registering proposals havent started yet"
      );
    });

    it("should revert for the start voting session status", async () => {
      await expectRevert(
        VotingInstance.startVotingSession({ from: owner }),
        "Registering proposals phase is not finished"
      );
    });

    it("should revert for the end voting session status", async () => {
      await expectRevert(
        VotingInstance.endVotingSession({ from: owner }),
        "Voting session havent started yet"
      );
    });

    it("should revert for the votes tallied status", async () => {
      await expectRevert(
        VotingInstance.tallyVotes({ from: owner }),
        "Current status is not voting session ended"
      );
    });

    // event

    it("should emit event on add", async () => {
      expectEvent(
        await VotingInstance.addVoter(owner, { from: owner }),
        "VoterRegistered",
        { voterAddress: owner }
      );
    });

    it("should emit event on start proposals registering", async () => {
      expectEvent(
        await VotingInstance.startProposalsRegistering({ from: owner }),
        "WorkflowStatusChange",
        { previousStatus: new BN(0), newStatus: new BN(1) }
      );
    });
  });

  // ------------------ Start proposals registering status ------------------ //

  describe("Start proposals registering status", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.addVoter(owner, { from: owner });
      await VotingInstance.addVoter(second, { from: owner });
      await VotingInstance.startProposalsRegistering({ from: owner });
    });

    // expect

    it("should store and show proposal in array", async () => {
      await VotingInstance.addProposal("Manger des chips", {
        from: owner,
      });
      const storedData = await VotingInstance.getOneProposal(0);
      expect(storedData.description).to.equal("Manger des chips");
    });

    it("should show voter in mapping", async () => {
      const storedData = await VotingInstance.getVoter(second, {
        from: second,
      });
      expect(storedData.isRegistered).to.be.true;
    });

    it("should end proposals registering", async () => {
      await VotingInstance.endProposalsRegistering({ from: owner });
      expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(
        new BN(2)
      );
    });

    // revert

    it("should revert when proposal submit whithout Voter status", async () => {
      await expectRevert(
        VotingInstance.addProposal("Manger des chips", { from: third }),
        "You're not a voter"
      );
    });

    it("should revert for add voter", async () => {
      await expectRevert(
        VotingInstance.addVoter(owner, { from: owner }),
        "Voters registration is not open yet"
      );
    });

    it("should revert when vote submit in a wrong WorkflowStatus", async () => {
      await expectRevert(
        VotingInstance.setVote(new BN(0), { from: owner }),
        "Voting session havent started yet"
      );
    });

    it("should revert end proposals registering without owner address", async () => {
      await expectRevert(
        VotingInstance.endProposalsRegistering({ from: second }),
        "Ownable: caller is not the owner"
      );
    });

    it("should revert for the start proposals registering status", async () => {
      await expectRevert(
        VotingInstance.startProposalsRegistering({ from: owner }),
        "Registering proposals cant be started now"
      );
    });

    it("should revert for the start voting session status", async () => {
      await expectRevert(
        VotingInstance.startVotingSession({ from: owner }),
        "Registering proposals phase is not finished"
      );
    });

    it("should revert for the end voting session status", async () => {
      await expectRevert(
        VotingInstance.endVotingSession({ from: owner }),
        "Voting session havent started yet"
      );
    });

    it("should revert for the votes tallied status", async () => {
      await expectRevert(
        VotingInstance.tallyVotes({ from: owner }),
        "Current status is not voting session ended"
      );
    });

    // event

    it("should emit event on end proposals registering", async () => {
      expectEvent(
        await VotingInstance.endProposalsRegistering({ from: owner }),
        "WorkflowStatusChange",
        { previousStatus: new BN(1), newStatus: new BN(2) }
      );
    });

    it("should emit on add proposal", async () => {
      expectEvent(
        await VotingInstance.addProposal("Manger des chips", {
          from: owner,
        }),
        "ProposalRegistered",
        { proposalId: new BN(0) }
      );
    });
  });

  // ------------------- End proposals registering status ------------------- //

  describe("End proposals registering status", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.addVoter(owner, { from: owner });
      await VotingInstance.addVoter(second, { from: owner });
      await VotingInstance.startProposalsRegistering({ from: owner });
      await VotingInstance.addProposal("Manger des chips", {
        from: owner,
      });
      await VotingInstance.addProposal("Laver ses slips", { from: second });
      await VotingInstance.endProposalsRegistering({ from: owner });
    });

    // expect

    it("should show voter in mapping", async () => {
      const storedData = await VotingInstance.getVoter(second, {
        from: second,
      });
      expect(storedData.isRegistered).to.be.true;
    });

    it("should show proposal in array", async () => {
      const storedData = await VotingInstance.getOneProposal(0);
      expect(storedData.description).to.equal("Manger des chips");
    });

    it("should start voting session", async () => {
      await VotingInstance.startVotingSession({ from: owner });
      expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(
        new BN(3)
      );
    });

    // revert

    it("should revert for add voter in a wrong WorkflowStatus", async () => {
      await expectRevert(
        VotingInstance.addVoter(owner, { from: owner }),
        "Voters registration is not open yet"
      );
    });

    it("should revert when vote submit in a wrong WorkflowStatus", async () => {
      await expectRevert(
        VotingInstance.setVote(new BN(0), { from: owner }),
        "Voting session havent started yet"
      );
    });

    it("should revert start voting session without owner address", async () => {
      await expectRevert(
        VotingInstance.startProposalsRegistering({ from: second }),
        "Ownable: caller is not the owner"
      );
    });

    it("should revert for the start proposals registering status", async () => {
      await expectRevert(
        VotingInstance.startProposalsRegistering({ from: owner }),
        "Registering proposals cant be started now"
      );
    });

    it("should revert for the end proposals registering status", async () => {
      await expectRevert(
        VotingInstance.endProposalsRegistering({ from: owner }),
        "Registering proposals havent started yet"
      );
    });

    it("should revert for the end voting session status", async () => {
      await expectRevert(
        VotingInstance.endVotingSession({ from: owner }),
        "Voting session havent started yet"
      );
    });

    it("should revert for the votes tallied status", async () => {
      await expectRevert(
        VotingInstance.tallyVotes({ from: owner }),
        "Current status is not voting session ended"
      );
    });

    // event

    it("should emit event on end proposals registering", async () => {
      expectEvent(
        await VotingInstance.startVotingSession({ from: owner }),
        "WorkflowStatusChange",
        { previousStatus: new BN(2), newStatus: new BN(3) }
      );
    });
  });

  // -----------------start voting session-------------------- //

  describe("Start voting session status", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.addVoter(owner, { from: owner });
      await VotingInstance.addVoter(second, { from: owner });
      await VotingInstance.startProposalsRegistering({ from: owner });
      await VotingInstance.addProposal("Manger des chips", { from: owner });
      await VotingInstance.addProposal("Laver ses slips", { from: second });
      await VotingInstance.endProposalsRegistering({ from: owner });
      await VotingInstance.startVotingSession({ from: owner });
    });

    // expect

    it("should set a vote and show vote count", async () => {
      await VotingInstance.setVote(new BN(0), { from: owner });
      const storedData = await VotingInstance.getOneProposal(new BN(0));
      expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(1));
    });

    it("should show voter in mapping", async () => {
      const storedData = await VotingInstance.getVoter(second, {
        from: second,
      });
      expect(storedData.isRegistered).to.be.true;
    });

    it("should show voted proposal ID", async () => {
      await VotingInstance.setVote(new BN(1), { from: owner });
      const storedData = await VotingInstance.getVoter(owner, { from: second });
      expect(storedData.votedProposalId).to.be.bignumber.equal(new BN(1));
    });

    it("should show proposal in array", async () => {
      const storedData = await VotingInstance.getOneProposal(0);
      expect(storedData.description).to.equal("Manger des chips");
    });

    it("should end voting session", async () => {
      await VotingInstance.endVotingSession({ from: owner });
      expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(
        new BN(4)
      );
    });

    // revert

    it("should revert for a second vote", async () => {
      await VotingInstance.setVote(new BN(0), { from: owner });
      await expectRevert(
        VotingInstance.setVote(new BN(0), { from: owner }),
        "You have already voted"
      );
    });

    it("should revert for a vote without voter status", async () => {
      await expectRevert(
        VotingInstance.setVote(new BN(0), { from: third }),
        "You're not a voter"
      );
    });

    it("should revert for add voter in a wrong WorkflowStatus", async () => {
      await expectRevert(
        VotingInstance.addVoter(owner, { from: owner }),
        "Voters registration is not open yet"
      );
    });

    it("should revert end voting session without owner address", async () => {
      await expectRevert(
        VotingInstance.startProposalsRegistering({ from: second }),
        "Ownable: caller is not the owner"
      );
    });

    it("should revert for the start proposals registering status", async () => {
      await expectRevert(
        VotingInstance.startProposalsRegistering({ from: owner }),
        "Registering proposals cant be started now"
      );
    });

    it("should revert for the end proposals registering status", async () => {
      await expectRevert(
        VotingInstance.endProposalsRegistering({ from: owner }),
        "Registering proposals havent started yet"
      );
    });

    it("should revert for the start voting session status", async () => {
      await expectRevert(
        VotingInstance.startVotingSession({ from: owner }),
        "Registering proposals phase is not finished"
      );
    });

    it("should revert for the votes tallied status", async () => {
      await expectRevert(
        VotingInstance.tallyVotes({ from: owner }),
        "Current status is not voting session ended"
      );
    });

    // event

    it("should emit event on set vote", async () => {
      expectEvent(
        await VotingInstance.setVote(new BN(0), { from: owner }),
        "Voted",
        { voter: owner, proposalId: new BN(0) }
      );
    });

    it("should emit event on end voting session", async () => {
      expectEvent(
        await VotingInstance.endVotingSession({ from: owner }),
        "WorkflowStatusChange",
        { previousStatus: new BN(3), newStatus: new BN(4) }
      );
    });
  });

  // -----------------end voting session-------------------- //

  describe("End voting session status", () => {
    beforeEach(async () => {
      VotingInstance = await Voting.new({ from: owner });
      await VotingInstance.addVoter(owner, { from: owner });
      await VotingInstance.addVoter(second, { from: owner });
      await VotingInstance.startProposalsRegistering({ from: owner });
      await VotingInstance.addProposal("Manger des chips", { from: owner });
      await VotingInstance.addProposal("Laver ses slips", { from: second });
      await VotingInstance.endProposalsRegistering({ from: owner });
      await VotingInstance.startVotingSession({ from: owner });
      await VotingInstance.setVote(new BN(0), { from: owner });
      await VotingInstance.setVote(new BN(0), { from: second });
      await VotingInstance.endVotingSession({ from: owner });
    });

    it("should tally votes", async () => {
      await VotingInstance.tallyVotes({ from: owner });
      expect(
        await VotingInstance.winningProposalID({
          from: second,
        })
      ).to.be.bignumber.equal(new BN(0));
    });

    it("should show winner", async () => {
      await VotingInstance.tallyVotes({ from: owner });
      expect(
        await VotingInstance.winningProposalID({
          from: third,
        })
      ).to.be.bignumber.equal(new BN(0));
    });

    it("should change workflow status to VotesTallied", async () => {
      await VotingInstance.tallyVotes({ from: owner });
      expect(await VotingInstance.workflowStatus.call()).to.be.bignumber.equal(
        new BN(5)
      );
    });

    it("should show voter in mapping", async () => {
      const storedData = await VotingInstance.getVoter(second, {
        from: second,
      });
      expect(storedData.isRegistered).to.be.true;
    });

    it("should show proposal in array", async () => {
      const storedData = await VotingInstance.getOneProposal(0);
      expect(storedData.description).to.equal("Manger des chips");
    });

    // revert

    it("should revert for tally votes without owner status", async () => {
      await expectRevert(
        VotingInstance.tallyVotes({ from: second }),
        "Ownable: caller is not the owner"
      );
    });

    it("should revert for add voter in a wrong WorkflowStatus", async () => {
      await expectRevert(
        VotingInstance.addVoter(owner, { from: owner }),
        "Voters registration is not open yet"
      );
    });

    it("should revert for the start proposals registering status", async () => {
      await expectRevert(
        VotingInstance.startProposalsRegistering({ from: owner }),
        "Registering proposals cant be started now"
      );
    });

    it("should revert for the end proposals registering status", async () => {
      await expectRevert(
        VotingInstance.endProposalsRegistering({ from: owner }),
        "Registering proposals havent started yet"
      );
    });

    it("should revert for the start voting session status", async () => {
      await expectRevert(
        VotingInstance.startVotingSession({ from: owner }),
        "Registering proposals phase is not finished"
      );
    });

    it("should revert for the end voting session status", async () => {
      await expectRevert(
        VotingInstance.endVotingSession({ from: owner }),
        "Voting session havent started yet"
      );
    });
    // event

    it("should emit event to tally vote", async () => {
      expectEvent(
        await VotingInstance.tallyVotes({ from: owner }),
        "WorkflowStatusChange",
        { previousStatus: new BN(4), newStatus: new BN(5) }
      );
    });
  });
});
