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

const label =
  svg.append('text')
    .attr('x', 15)
    .attr('y', 15)
    .attr('dominant-baseline', 'hanging')
    .text("Text 098876542351 to join in")



function render(data) {

  d3.packSiblings(data)

  const circle = svg.selectAll('circle').data(data)

  circle
    .style('transform', d => `translate(${d.x + w/2}px, ${d.y + h/2}px)`)

  circle
    .enter()
      .append('circle')
      .attr('fill', d => d.color)

      // delay so they bumble about a bit more
      .style('transition-delay', (d,i) => `${Math.random()}s`)
      .style('transform', d => `translate(${d.x + w/2}px, ${d.y + h/2}px)`)


      .attr('r', 0)
      .transition()
      .attr('r', d => d.r * 0.8)


}


render([])





// Test data/events


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

render(data)



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

//
// for(var i = 0; i < 30; i++ ){
//
//   setTimeout(() => {
//
//     data.push({
//       number: '441826465',
//       color: '#ccc',
//       r: 40 + Math.random() * 20
//     })
//
//     render(data)
//
//   }, Math.random() * 15000)
// }
