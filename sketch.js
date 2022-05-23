var scene;
let btnMutation, btnSameColor;
let mouseDragging = false;
let inputAddEdge, inputDeleteEdge;

function setup() {
    createCanvas(windowWidth, windowHeight);

    // create scene
    scene = new Scene({});
    scene.setup();

    // mode
    angleMode(DEGREES);
    colorMode(HSB, 255);

    btnMutation = createBtn("reset clock", createVector(30, 45), setNodesMutation);
    btnSameColor = createBtn("reset color", createVector(30, 80), setNodesSameColor);
    inputAddEdge = createInputBtn(" new edge", createVector(30, 115), setNewEdge);
    // inputDeleteEdge = createInputBtn("delete edge", createVector(30, 150), setdeleteEdge)
}

function draw() {
    background(0);
    // fill(255);

    mouseDragging = false;

    scene.run();

    // if (frameCount > 150) {
    scene.draw();
    // } else {
    //     push()
    //     translate(width / 2, height / 2)
    //     fill(sin(frameCount * 2) * 255 + 10)
    //     circle(0, 0, 15)
    //     fill(sin(frameCount * 2 + 50) * 255 + 10)
    //     circle(-45, 0, 15)
    //     fill(sin(frameCount * 2 - 50) * 255 + 10)
    //     circle(45, 0, 15)
    //     pop()
    // }

    // noLoop();
}

function mouseClicked() {
    if (!mouseDragging) {
        scene.nodes.forEach(n => {
            if (n.ifInside(mouseX, mouseY)) {
                n.sendMessage();
            }
        });
    }
}

function mouseDragged() {
    scene.nodes.forEach(n => {
        if (n.ifInside(mouseX, mouseY)) {
            n.setPosition(mouseX, mouseY);
        }
    })
    mouseDragging = true;
}

function createBtn(name, pos, callback) {
    let btn = createButton(name);
    btn.position(pos.x, pos.y);
    btn.mousePressed(callback);
    return btn;
}

function createInputBtn(name, pos, callback) {
    let input = createInput();
    input.position(pos.x, pos.y);
    input.size(100);
    let btn = createBtn(name, createVector(pos.x + input.width, pos.y), callback);
    return [input, btn];
}


// =============================================================
// /* button event */
function setNodesMutation() {
    scene.nodes.forEach(n => {
        n.setMutation();
    })
}

function setNodesSameColor() {
    scene.nodes.forEach(n => {
        n.setColorHue(32);
    })
}

function setNewEdge() {
    let newPairStr = inputAddEdge[0].value();
    let pair = newPairStr.split(/\D/).map(idx => int(idx));

    if (pair.length == 2 && scene.checkNewEgIndexlegal(pair)) {
        scene.addOneEdge(str(pair));
        inputAddEdge[0].value("");
    } else {
        inputAddEdge[0].value("illegal input");
    }
}

// function setdeleteEdge() {
//     let newPairStr = inputDeleteEdge[0].value();
//     let pair = newPairStr.split(/\D/).map(idx => int(idx));
//     if (pair.length == 2 && scene.checkEdgeExisted(pair)) {
//         scene.addOneEdge(str(pair));
//         inputAddEdge[0].value("");
//     } else {
//         inputAddEdge[0].value("illegal input");
//     }
// }