export class Timer {
    constructor() {
        this.start = Date.now();
    }

    get end() {
        const timeTaken = Date.now() - this.start;
        return timeTaken;
    }
}
