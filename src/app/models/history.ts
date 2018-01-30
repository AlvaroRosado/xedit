import { isNil } from 'ramda'

export class History {

    // Variables
    private maxStates: number;
    private pos: number;
    private states: Array<any>;

    // Contructor
    constructor(initState: any = null, maxStates: number = 50) {
        this.pos = 0;
        this.states = new Array;
        this.setMaxStates(maxStates);
        if (!isNil(initState))
            this.addState(initState);
    }

    //************************************** Getters and setters **************************************/
    getState() {
        return this.states[this.pos] || null
    }

    setState(states: Array<any>) {
        this.states = states;
    }

    getMaxStates() {
        return this.maxStates;
    }

    setMaxStates(maxStates: number) {
        if (maxStates <= 0 && !Number.isInteger(maxStates))
            throw new TypeError('Invalid maxStates');
        this.maxStates = maxStates;
    }


    /************************************** Private Methods **************************************/

    /**
     * Get the number of states
     */
    private countStates(): number {
        return this.states.length;
    }

    /**
     * Check if there are the maximun number of states (By default 100)
     */
    private checkMaxStates(): boolean {
        return this.countStates() > this.maxStates;
    }

    /************************************** Public Methods **************************************/

    /**
     * Added a new state
     */
    addState(state: any): void {

        if (this.countStates() > this.pos)
            this.states.splice(this.pos + 1, this.countStates());

        if (this.checkMaxStates()) {
            this.states.shift();
            this.pos--;
        }

        this.states.push(state);
    }

    /**
     * Return to the previous state if it exists, otherwise it does not do anything
     */
    lastState(): any {
        if (this.hasPreviousState())
            this.pos--;

        return this;
    }

    /**
     * Go to the next state if it exists, otherwise it does not do anything
     */
    nextState(): any {
        if (this.hasNextState())
            this.pos++;

        return this;
    }

    /**
     * Go to the initial state
     */
    resetState(): any {
        this.pos = 0;

        return this;
    }

    /**
     * Added new state 
     */
    newState(state: any): Object {
        this.addState(state);
        this.pos++;

        return this;
    }

    /**
     * Check if there is a next state
     */
    hasNextState(): boolean {
        return this.pos < this.countStates() - 1;
    }

    /**
     * Check if there is a previous state
     */
    hasPreviousState(): boolean {
        return this.pos > 0;
    }
}
