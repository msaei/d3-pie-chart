const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) };

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width + 150)
    .attr('height', dims.height + 150);

const graph = svg.append('g')
    .attr('transform', `translate(${cent.x},${cent.y})`);

const pie = d3.pie()
    .sort(null)
    .value(d => d.amount)


const arcPath = d3.arc()
    .outerRadius(dims.radius)
    .innerRadius(dims.radius / 2);

const color = d3.scaleOrdinal(d3['schemeSet3']);

//update function
function update(data) {
    //update scale color domain
    color.domain(data.map(d => d.name))

    //join enhanced (pie) data to path elements
    const paths = graph.selectAll('path')
        .data(pie(data));

    // remove exit selection
    paths.exit()
        .transition().duration(1000)
        .attrTween('d', arcTweenExit)
        .remove();

    // add attrs to paths already in the DOM
    paths.attr('d', arcPath);

    // append the enter selection to the DOM
    paths.enter()
        .append('path')
        .attr('class', 'arc')
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .attr('fill', d => color(d.data.name))
        .transition().duration(1000)
        .attrTween('d', arcTweenEnter);
}

// data array and firebase
var data = [];
db.collection("activities").onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = {...change.doc.data(), id: change.doc.id };
        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }
    })
    update(data)
})

//tween functions
const arcTweenEnter = (d) => {
    var i = d3.interpolate(d.endAngle, d.startAngle);
    return function(t) {
        d.startAngle = i(t)
        return arcPath(d);
    }
}

const arcTweenExit = (d) => {
    var i = d3.interpolate(d.startAngle, d.endAngle);
    return function(t) {
        d.startAngle = i(t)
        return arcPath(d);
    }
}