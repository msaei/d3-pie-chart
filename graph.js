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

// setup legend
const legendGroup = svg.append('g')
    .attr('transform', `translate(${dims.width + 40}, 10)`);

const legend = d3.legendColor()
    .shape('circle')
    .shapePadding(10)
    .scale(color);

const tip = d3.tip()
    .attr("class", "tip card")
    .html(d => {
        return `<p> Hi there <p>`
    })

graph.call(tip);

//update function
function update(data) {
    //update scale color domain
    color.domain(data.map(d => d.name))

    //update and call legend
    legendGroup.call(legend);
    legendGroup.selectAll('text').attr('fill', 'white');

    //join enhanced (pie) data to path elements
    const paths = graph.selectAll('path')
        .data(pie(data));

    // remove exit selection
    paths.exit()
        .transition().duration(1000)
        .attrTween('d', arcTweenExit)
        .remove();

    // add attrs to paths already in the DOM
    paths.attr('d', arcPath)
        .transition().duration(1000)
        .attrTween('d', arcTweenUpdate);

    // append the enter selection to the DOM
    paths.enter()
        .append('path')
        .attr('class', 'arc')
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .attr('fill', d => color(d.data.name))
        .each(function(d) { this._current = d })
        .transition().duration(1000)
        .attrTween('d', arcTweenEnter);

    // add event listeners
    d3.selectAll('path')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('click', handleClick)
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

function arcTweenUpdate(d) {

    var i = d3.interpolate(this._current, d);
    this_current = d;
    return function(t) {
        return arcPath(i(t));
    }
}

//event handlers
const handleMouseOver = (d, i, n) => {
    tip.show(d, n[i]);
    d3.select(n[i])
        .transition('changeSliceFill').duration(500)
        .attr('fill', '#fff');

}

const handleMouseOut = (d, i, n) => {
    tip.hide();
    d3.select(n[i])
        .transition('changeSliceFill').duration(500)
        .attr('fill', color(d.data.name));
}

const handleClick = (d) => {
    const id = d.data.id;
    db.collection('activities').doc(id).delete()
        .catch(e => {
            console.log(e.message)
        });
}