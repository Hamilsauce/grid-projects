const id = 'stupid-id'
const className = 'stupid-classname'
const textContent = 'FUK HELL'

const app = document.querySelector('#app');
const appBody = app.querySelector('#app-body')
const containers = document.querySelectorAll('.container')

const el = document.createElement('div');



Object.assign(el, {
  id,
  className,
  style: {
    background: 'pink',
    color: 'white',
  },
  textContent,
})

appBody.innerHTML = ''
appBody.append(el);