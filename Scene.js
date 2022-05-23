class Scene {
    // =============================================================
    // /* constructor */
    constructor(args) {
        this.nodes = [];
        this.numOfNode = args.numOfNode || 12;
        this.edges = [];
    }

    // =============================================================
    // -------------------------------------------------------------
    // /* setup */
    setup() {
        // create nodes 
        for (let i = 0; i < this.numOfNode; i++) {
            let newNode = new Node({
                p: createVector(width / 2 + random(100), height / 2 + random(100)),
                r: random(30, 40),
                id: i
            })
            newNode.setup();
            this.nodes.push(newNode);
        }

        // add edges
        this.addEdges_byString(this.createEdgeSample());

    }

    // -------------------------------------------------------------
    // /* run loop */
    run() {

        // edge force
        this.edges.forEach(e => {
            e.run();
        })

        // circle packing
        for (let i = 0; i < this.numOfNode; i++) {
            for (let j = 0; j < this.numOfNode; j++) {
                if (i == j) continue;
                else {
                    this.nodes[i].checkIntersec(this.nodes[j]);
                }
            }
        }

        // nodes run 
        this.nodes.forEach(n => {
            n.run();
        })

        this.runNodesSync();
        this.runMsgBroadcast()


    }

    // -------------------------------------------------------------
    // /* draw loop */
    draw() {
        // draw edges
        this.edges.forEach(e => {
            e.draw();
        })

        // draw nodes 
        this.nodes.forEach(p => {
            p.draw();
        })
    }

    // =============================================================
    // /* add edges by array */
    addEdges_byArray(edges) {
        // edges = [[a,b],[a,c],[a,d]];
        edges.forEach(pair => {
            // *check if same edge exsist
            let eg = new Edge({
                node1: this.nodes[int(pair[0])],
                node2: this.nodes[int(pair[1])]
            });
            this.edges.push(eg);
            this.updateLink(int(pair[0]), int(pair[1]));
        })

    }


    // /* add edges by string */
    addEdges_byString(edges) {
        // edges = "1,2;1,3;1,4"
        let pairs = edges.split(';');

        let wetarray = [1, 1.5, 2, 2.5, 3, 3.5, 4, 8];
        let wmax = max(wetarray);


        pairs.forEach(pair => {
            let inxs = pair.split(',');
            // *check if same edge 
            let wet = random(wetarray);
            // console.log(wmax);
            let eg = new Edge({
                node1: this.nodes[int(inxs[0])],
                node2: this.nodes[int(inxs[1])],
                weight: wet,
                wMax: wmax
            });
            this.edges.push(eg);
            this.updateLink(int(inxs[0]), int(inxs[1]), wet);
        })

        this.updateWeightMax(wmax);
        // console.log(this.nodes)
    }

    addOneEdge(pair) {
        let eg = new Edge({
            node1: this.nodes[pair[0]],
            node2: this.nodes[pair[1]]
        })
        this.edges.push(eg);
        this.updateLink(pair[0], pair[1], eg.weight);
    }

    checkNewEgIndexlegal(pair) {
        // not already exist
        // in the range of nodes index
        let legal = true;
        let series = new Array(this.nodes.length).fill().map((element, index) => index);
        if (!series.includes(pair[0]) || !series.includes(pair[1])) legal = false;
        if (this.checkEdgeExisted(pair)) legal = false;

        return legal;

    }

    checkEdgeExisted(pair) {
        let existed = false;
        this.edges.forEach(eg => {
            if (eg.node1.id == pair[0] && eg.node1.id == pair[1]) existed = true;
            else if (eg.node1.id == pair[1] && eg.node2.id == pair[0]) existed = true;
        })
        return existed;
    }

    updateWeightMax(wmax) {
        this.nodes.forEach(n => {
            n.weightMax = wmax;
        })
    }

    updateLink(idx1, idx2, wet) {
        this.nodes[idx1].linkList.push(this.nodes[idx2])
        this.nodes[idx2].linkList.push(this.nodes[idx1])
        this.nodes[idx1].weightList.push(wet);
        this.nodes[idx2].weightList.push(wet);
    }


    // /*  delete edges */
    deleteEdges() {
        this.edges = [];
    }

    deleteOneEdge(pair) {

    }

    // /* check if same edge exsist
    createEdgeSample() {
        let edgesStr = ""
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = 0; j < this.nodes.length; j++) {
                if (j > i && random() < 0.2) {
                    let pair = str(i) + "," + str(j) + ";"
                    edgesStr = edgesStr + pair;
                }
            }
        }
        edgesStr = edgesStr.slice(0, -1);
        // console.log(edgesStr);
        return edgesStr;
    }

    // =============================================================
    // /* nodes sync */
    runNodesSync() {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].broadcast) {
                for (let j = 0; j < this.nodes.length; j++) {
                    if (this.nodes[j].checkLinked(i)) {
                        this.nodes[j].clockSync(i);
                    }
                }
                this.nodes[i].broadcast = false;
            }
        }
    }

    // =============================================================
    // /* nodes msg broadcast */
    runMsgBroadcast() {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].msgBroadcast) {
                for (let j = 0; j < this.nodes.length; j++) {
                    if (this.nodes[j].checkLinked(i) && this.nodes[j].checkSyncRate(this.nodes[i].clk)) {
                        this.nodes[j].receiveMessage(this.nodes[i].hue);
                    }
                }
                this.nodes[i].msgBroadcast = false;
            }
        }
    }


}