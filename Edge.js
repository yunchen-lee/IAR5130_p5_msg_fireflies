class Edge {
    constructor(args) {
        this.node1 = args.node1;
        this.node2 = args.node2;
        this.weight = args.weight || 3;
        this.wMax = args.wMax || 8; //[1, 1.5, 2, 2.5, 3, 3.5, 4, 8]
    }

    run() {
        let len = this.node1.p.dist(this.node2.p);
        let minDist = this.node1.r * 2 + this.node2.r * 2;

        // if (len > minDist && frameCount < 30) {
        if (len > minDist) {

            let direct = createVector(this.node1.p.x - this.node2.p.x, this.node1.p.y - this.node2.p.y);
            direct = direct.mult(0.48)
            let negDirect = createVector(-direct.x, -direct.y);

            // this.drawArrow(this.node2.p, direct, "red");
            // this.drawArrow(this.node1.p, negDirect, "blue");

            this.node1.p = p5.Vector.add(this.node1.p, negDirect);
            this.node2.p = p5.Vector.add(this.node2.p, direct);

        }

    }

    draw() {
        push();
        stroke(100);
        strokeWeight(this.remap(this.weight, 0, this.wMax, 0, 8));
        line(this.node1.p.x, this.node1.p.y, this.node2.p.x, this.node2.p.y);
        pop();
    }


    drawArrow(base, vec, myColor) {
        push();
        stroke(myColor);
        strokeWeight(3);
        fill(myColor);
        translate(base.x, base.y);
        line(0, 0, vec.x, vec.y);
        rotate(vec.heading());
        let arrowSize = 7;
        translate(vec.mag() - arrowSize, 0);
        triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
        pop();
    }

    // =============================================================
    // /* remap */
    remap(val, sMin, sMax, tMin, tMax) {
        if (val < sMin) val = sMin;
        else if (val > sMax) val = sMax;
        return (val - sMin) * (tMax - tMin) / (sMax - sMin) + tMin;
    }
}