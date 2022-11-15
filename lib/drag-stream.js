const { fromEvent, delay, of } = rxjs;
const { mergeMap, sample, takeUntil, takeWhile, switchMap, scan, map, tap, filter, } = rxjs.operators;


const getPointerEvents = (target) => {
  return fromEvent(target, 'pointerdown')
    .pipe(
      switchMap(downEvent => of (downEvent)
        .pipe(
          map(x => x),
          tap(x => console.log('TAP', x)),
        )
      )
    );

  return {
    down$: fromEvent(target, 'pointerdown'),
    move$: fromEvent(document, 'pointermove'),
    up$: fromEvent(document, 'pointerup'),
  }
}

getPointerEvents.subscribe()

export const addDragAction = (target, callback) => {
  let isDragging = false
  const setDragState = (state = true) => { isDragging = state; return isDragging };

  const pointerdown$ = fromEvent(target, 'pointerdown')
  const pointermove$ = fromEvent(document, 'pointermove')
  const pointerup$ = fromEvent(document, 'pointerup')

  const longpress$ = pointerdown$
    .pipe(
      filter(() => isDragging === false),
      switchMap(downEvent => of (downEvent).pipe(
        filter(({ clientX, clientY }) => {
          return clientX - downEvent.clientX < 50 &&
            clientY - downEvent.clientY < 50
        }),
        delay(300),
        takeUntil(pointerup$),
        map(({ pageX, pageY }) => {
          console.log(`{
            x: pageX + (pageX - (downEvent.pageX)) + 50,
            y: pageY + (pageY - downEvent.pageY) - 40,
          }`, {
            x: pageX + (pageX - (downEvent.pageX)) + 50,
            y: pageY + (pageY - downEvent.pageY) - 40,
          })
          return {
            x: pageX + (pageX - (downEvent.pageX)) + 50,
            y: pageY + (pageY - downEvent.pageY) - 40,
          }
        }),
        // tap(x => console.log('BEFORE TAKEWHILE', x)),
        // mergeMap((event) => of (event).pipe(
        //   tap(x => console.log('IN sample', { x })),
        //   takeWhile((distMin) => pointermove$.pipe(


        //     tap(x => console.log('AFTER sample', x)),
        //   )),
        // )),
        tap(x => console.warn('[AFTER]: takeWhile(() => pointermove$.pipe $: ', x)),
      )),
    );

  return longpress$.pipe(
    tap(() => setDragState(true)),
    switchMap(() => pointermove$
      .pipe(
        takeWhile(() => isDragging),
        map(({ target, clientX, clientY }) => ({ target: target.closest('.context-menu'), x: clientX, y: clientY })),
        scan((prev, { target, x, y }) => {
          return !!prev ? {
            target,
            x: (prev.x + -(prev.x - x)),
            y: (prev.y + -(prev.y - y)),
          } : { target, x: x, y: y, }
        }),
        tap(callback),
        switchMap(() => pointerup$
          .pipe(
            map(({ target, clientX, clientY }) => ({ target, x: clientX, y: clientY })),
            tap(() => setDragState(false)),
          ))
      ))
  );
};
