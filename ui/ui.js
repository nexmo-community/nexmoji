/* global d3, window */

const svg = d3.select('body').append('svg')

let w, h

function size () {
  w = window.innerWidth
  h = window.innerHeight

  svg
    .attr('width', w)
    .attr('height', h)
}

size()

window.addEventListener('resize', size)


const data = [
  {
    number: '441826464',
    color: 'aquamarine',
    r: 50
  },
  {
    number: '441826466',
    color: '#f08',
    r: 40
  },
  {
    number: '441826465',
    color: '#08f',
    r: 50
  }
]



let circle = svg.selectAll('circle')

function render(data) {

  d3.packSiblings(data)

  circle = svg.selectAll('circle').data(data)

  circle
    .transition()
      .attr('cx', d => d.x + w/2)
      .attr('cy', d => d.y + h/2)
      .attr('r', d => d.r * 0.8)
    .delay( (_, i) => i * 150)
    .duration(1000)

  circle
    .enter()
      .append('circle')
      .attr('cx', d => d.x + w/2)
      .attr('cy', d => d.y + h/2)
      .attr('r', () => 0)
      .attr('fill', d => d.color)
      .transition()
      .attr('r', d => d.r * 0.8)
      .duration(1500)

}


render(data)





// Test data

setTimeout(() => {

  data.push({
    number: '441826465',
    color: '#80f',
    r: 40
  })

  render(data)

}, 500)

setTimeout(() => {

  data.push({
    number: '441826465',
    color: '#fc0',
    r: 40 + Math.random() * 20
  })

  render(data)

}, 1500)

setTimeout(() => {

  data.push({
    number: '441826465',
    color: '#08c',
    r: 40 + Math.random() * 20
  })

  render(data)

}, 2500)
