import { svg } from './template'

const rect = svg('rect', '.rect')
const g = svg('g', '.g')
const animate = svg('animateTransform', '.animateTransform')


const bar = ({ translate, opacity, begin }) => 
  g({ transform: `translate(${translate.join(' ')})` }, 
    rect({ x: -10, y: -30, width: 20, height: 60, fill: '#ffffff', opacity },
      animate({ 
        attributeName: 'transform', 
        type: 'scale', 
        from: 2, 
        to: 1, 
        begin, 
        repeatCount: 'indefinite',
        dur: '1s',
        calcMode: 'spline',
        keySplines: '0.1 0.9 0.4 1',
        keyTimes: '0;1',
        values: '2;1'
      })
    )
  ) 

const loader = () => 
  svg('svg', '.svg', { width: '22px', height: '22px', viewBox: '0 0 100 100' },
    bar({ translate: [20, 50], opacity: 0.6, begin: '0s' }),
    bar({ translate: [50, 50], opacity: 0.8, begin: '.1s' }),
    bar({ translate: [80, 50], opacity: 0.9, begin: '.2s' })
  )

export default loader
