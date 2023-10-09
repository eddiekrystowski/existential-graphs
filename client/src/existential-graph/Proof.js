import { Queue } from "./Queue"

/**
 * Proofs are represented as a series of logical steps. This often includes more than one physical change to the graph for a single step
 */
class Proof {
    constructor()
    {
        this.proof = new Queue();
    }

    addStep(step) {
        // TODO
        this.proof.push(step);
    }
}