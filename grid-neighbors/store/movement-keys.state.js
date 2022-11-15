const { forkJoin, Observable, iif, BehaviorSubject, AsyncSubject, Subject, interval, of , fromEvent, merge, empty, delay, from } = rxjs;
const { flatMap, reduce, groupBy, toArray, mergeMap, switchMap, scan, map, tap, filter } = rxjs.operators;
const { fromFetch } = rxjs.fetch;

const controls = document.querySelector('#controls');
const appBody = document.querySelector('#app-body')
const containers = document.querySelectorAll('.container')

export const movesKeys$ = fromEvent(controls, 'click')
  .pipe(
    map(({ target }) => target.closest('.move-button').dataset.direction),
  );
  // .pipe(
    
  //   map(x => x),
  //   tap(x => console.log('TAP', x))
  // );
  
  // his.buttonEvents$ = fromEvent(this.self, 'click')
      // .pipe(
      //   map(({ target }) => target.closest('.move-button').dataset.direction),
      // );


// this.moveSubscription = merge(this.#mapControls.buttonEventStream$).pipe(
//   tap(x => console.warn('moveSubscription', x)),
//   filter(_ => _),
//   tap(dir => { this.#mapModel.moveCharacter(dir) }),
//   // tap(x => console.warn('this.#characterTile', this.#characterTile)),
//   // map(() => this.#characterTile),
//   filter(_ => _),

//   // scan(({ nextScrollRight, nextScrollLeft }, char) => {
//   //   const { innerWidth } = window;
//   //   const { right, left } = char.getBoundingClientRect();

//   //   const currentScreenLeft = left + (nextScrollRight - innerWidth);
//   //   const currentScreenRight = right + (nextScrollLeft - innerWidth);

//   //   console.table(
//   //   {
//   //     currentScreenLeft,
//   //     currentScreenRight,
//   //     // nextScrollLeft,
//   //     // left,
//   //   });

//   //   if (currentScreenLeft >= nextScrollRight) {
//   //     this.#mapView.scroll({ left: nextScrollRight, behavior: 'smooth' });
//   //     nextScrollRight = nextScrollRight + innerWidth;
//   //   }

//   //   if (currentScreenLeft <= nextScrollLeft) {
//   //     this.#mapView.scroll({ right: nextScrollLeft, behavior: 'smooth' });
//   //     nextScrollLeft = nextScrollLeft - innerWidth;
//   //   }

//   //   return { nextScrollRight, nextScrollLeft };
//   // }, { nextScrollRight: window.innerWidth, nextScrollLeft: 0 }),
// ).subscribe();
