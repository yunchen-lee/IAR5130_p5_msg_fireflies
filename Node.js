class Node {
    // =============================================================
    // /* constructor */
    constructor(args) {
        this.p = args.p || createVector(width / 2, height / 2);
        this.r = args.r || 30;
        this.clockR = args.clockR || 20;
        this.id = args.id;
        this.linkList = [];
        this.weightList = [];
        this.weightMax = args.weightMax;
        // clock ----------------------------------------
        this.clk = args.clk; // shiftTime
        this.clkPeriod = args.clkPeriod || 1500; //millis 1000 = 1s
        this.currentTime = 0; // current time/ period
        this.preTime = 0; // pretime
        this.broadcast = false;
        // light ----------------------------------------
        this.lightCycle = args.lightCycle || 0.5; // range(0,1)
        this.lightPeriod; // clkPeriod * lightCycle (0,1)
        // this.hueNum = args.hueNum || 10;
        this.hue = args.hue || 32;
        this.sat = args.sat || 0;
        this.bright = args.bright || 255;
        //sync ----------------------------------------
        this.syncTolerance = args.syncTolerance || 0.1; // range(0.032,1)
        this.mutationCycle = 30000;
        this.mutationRate = 0.1;
        // send message ----------------------------------------
        this.msgBroadcast = false;
        this.receiveTolerance = args.receiveTolerance || 0.1; // range(0,1);
    }

    // =============================================================
    // -------------------------------------------------------------
    // /* setup */
    setup() {
        this.lightPeriod = int(this.clkPeriod * this.lightCycle);
        this.clk = random(this.clkPeriod);
    }

    // -------------------------------------------------------------
    // /* draw loop */
    draw() {
        // draw node
        push();
        translate(this.p.x, this.p.y);
        fill(this.hue, this.sat, this.bright);
        stroke(100);
        circle(0, 0, this.clockR);


        // draw circle
        // stroke(70)
        // noFill();
        // circle(0, 0, this.r * 2)

        // draw text of index
        textSize(10);
        noStroke()
        fill(180);
        textAlign(CENTER, CENTER);
        text(this.id, 0, -this.clockR * 0.9);


        // draw clock
        stroke(0, 255, 255);
        noFill();
        let p = this.getClockAng();
        line(0, 0, -p.x * this.clockR / 2, -p.y * this.clockR / 2);

        pop();
    }

    // -------------------------------------------------------------
    // /* run loop */
    run() {
        this.currentTime = int(millis()) + this.clk;
        this.currentTime = this.currentTime % this.clkPeriod;

        if (abs(this.preTime - this.currentTime) > int(this.clkPeriod * 0.8)) {
            this.broadcast = true;
        }

        this.preTime = this.currentTime;
        this.clockMutation();
        this.sat = this.setColorsSaturation();

    }

    // =============================================================
    // -------------------------------------------------------------
    // /* circle packing */
    checkIntersec(pts) {
        let p2pts = createVector(this.p.x - pts.p.x, this.p.y - pts.p.y, this.p.z - pts.p.z);
        let distance = p2pts.mag();
        if (distance < this.r + pts.r) {
            let moveStep = -(distance - this.r - pts.r) / 7.0;
            p2pts.normalize();
            p2pts.mult(moveStep);
            this.p = createVector(this.p.x + p2pts.x, this.p.y + p2pts.y, this.p.z + p2pts.z)
        }
    }

    // -------------------------------------------------------------
    // /* set color in light cycle */
    getColor() {
        let clr = color(this.setColorsHue(), this.setColorsSaturation, 100);
    }

    pickColorsHue() {
        // let series = new Array(this.hueNum).fill().map((element, index) => index / this.hueNum);
        // return int(random(series) * 360);
        let series = [32, 55, 135, 155, 200, 245];
        return random(series);
    }

    setColorHue(h) {
        this.hue = h;
    }

    setColorsSaturation() {

        if (this.currentTime < this.lightPeriod) {
            let t = this.remap(this.currentTime, 0, this.lightPeriod, 0, 180);
            return 255 - pow(sin(t), 2) * 255;
        }
        return 255;
    }

    getClockAng() {
        let ang = this.remap(this.currentTime, 0, this.clkPeriod, 0, 360);
        let x = cos(ang);
        let y = sin(ang);
        let p = createVector(x, y)
        return p;
    }

    // -------------------------------------------------------------
    // /* sync */
    clockSync(targetIdx) {
        // this.clk += 30;
        let wet;
        // console.log(targetIdx)
        // this.linkList.forEach(link => {
        //     console.log(link.id)
        //     if (link.id == targetIdx) wet = this.weightList[link.id];
        // })
        for (let i = 0; i < this.linkList.length; i++) {
            if (this.linkList[i].id == targetIdx) wet = this.weightList[i]
        }

        // console.log(wet)
        let span = this.remap(wet, 0, this.weightMax, 0, 80);
        this.clk += span;
        if (this.checkSycnTolerance()) this.clk = 0;
    }



    checkLinked(otherid) {
        let match = false;
        this.linkList.forEach(n => {
            if (n.id == otherid) {
                match = true;
            }
        })
        return match;
    }

    checkSycnTolerance() {
        let inTolerance = false;
        if (this.clk < int(this.clkPeriod * this.syncTolerance) || (this.clkPeriod - this.clk) < int(this.clkPeriod * this.syncTolerance)) {
            inTolerance = true;
        }
        return inTolerance;
    }

    // -------------------------------------------------------------
    // /* mutation */
    clockMutation() {
        if (millis() % this.mutationCycle < 10) this.clk = random(this.clkPeriod);
    }

    setMutation() {
        this.clk = random(this.clkPeriod);
    }

    // =============================================================
    // /* send message and receive message */
    sendMessage() {
        this.setColorHue(this.pickColorsHue());
        this.msgBroadcast = true;

    }

    checkSyncRate(otherclk) {
        let inTolerance = false;
        let tol = int(this.clkPeriod * this.receiveTolerance);
        let state1 = abs(this.clk - otherclk) < tol;
        let state2 = ((this.clkPeriod - otherclk) + (this.clk)) < tol;
        let state3 = ((this.clkPeriod - this.clk) + otherclk) < tol;
        if (state1 || state2 || state3) { inTolerance = true; }
        return inTolerance
    }

    receiveMessage(otherhue) {
        if (this.hue != otherhue) {
            this.msgBroadcast = true;
            this.setColorHue(otherhue);
        }
    }

    ifOutOdBag() {

    }

    // =============================================================
    // /* mouse drag */
    setPosition(mousex, mousey) {
        this.p.x = mousex;
        this.p.y = mousey;
    }


    // =============================================================
    // /* remap */
    remap(val, sMin, sMax, tMin, tMax) {
        if (val < sMin) val = sMin;
        else if (val > sMax) val = sMax;
        return (val - sMin) * (tMax - tMin) / (sMax - sMin) + tMin;
    }

    // /* if location inside node */
    ifInside(x, y) {
        let ifinside = false;
        let dis = dist(this.p.x, this.p.y, x, y);
        if (dis < this.clockR) ifinside = true;
        return ifinside;
    }
}