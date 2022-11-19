const foreignObject = `
<foreignObject x="20" y="20" width="160" height="160">
    <div xmlns="http://www.w3.org/1999/xhtml">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed mollis mollis mi ut ultricies. Nullam magna ipsum,
      porta vel dui convallis, rutrum imperdiet eros. Aliquam
      erat volutpat.
    </div>
  </foreignObject>
`

const SVG_NS = 'http://www.w3.org/2000/svg'

export class SelectionBox {
  #self;
  constructor(initialPoint) {
    this.#self = document.createElementNS(SVG_NS, 'g');
    // this.surface = document.createElementNS(SVG_NS, 'rect');
    this.selectionBox = document.createElementNS(SVG_NS, 'rect');

    const start = document.createElementNS(SVG_NS, 'circle');
    start.classList.add('selection-handle');
    start.id = 'start-handle';

    const end = document.createElementNS(SVG_NS, 'circle');
    end.classList.add('selection-handle');
    end.id = 'end-handle';

    this.handles = {
      start,
      end,
    }
this.init(initialPoint, 1)
    // this.content.classList.add('selection');


    // this.panel.appendChild(this.content)
    // this.surface.x.baseVal.value = +tile.dataset.x + 1.5;
    // this.surface.y.baseVal.value = +tile.dataset.y - 2.5;
    // this.surface.setAttribute('width', 2.5)
    // this.surface.setAttribute('height', 5.5)
    // this.surface.setAttribute('fill', 'white')
    // this.surface.setAttribute('stroke', 'black')
    // this.surface.setAttribute('stroke-width', 0.1)
    // this.panel.classList.add('panel')

//   this.createPanelContent(tile)
    // this.surface = 
  }

  appendTo(el) { el.appendChild(this.panel) }

  init(point, unitSize = 1) {
    this.selectionBox.setAttribute('width', 1)
    this.selectionBox.setAttribute('height', 1)
    this.selectionBox.setAttribute('x', point.x)
    this.selectionBox.setAttribute('y', point.y)
    // this.content.setAttribute('transform', 'scale(0.75)')
    // this.panel.setAttribute('transform', 'scale(1)')

    // this.content.appendChild(div1)
    this.#self.appendChild(this.selectionBox);

    this.handles.start.setAttribute('r', 0.25)
    this.handles.start.setAttribute('cx', point.x)//this.boundingBox.x)
    this.handles.start.setAttribute('cy', point.y)//this.boundingBox.y)

    this.handles.end.setAttribute('r', 0.25)
    this.handles.end.setAttribute('cx', point.x+1)//this.boundingBox.right)
    this.handles.end.setAttribute('cy', point.y+1)//this.boundingBox.bottom)
 
    this.#self.append(this.handles.start, this.handles.end);


  }

  removeFrom(el) {
    el.removeChild(this.panel)
    // el.removeChild(this.surface )

  }



  get dom() { return this.#self };
  get boundingBox() { return this.selectionBox.getBoundingClientRect() };
  set prop(newValue) { this._prop = newValue };
}
