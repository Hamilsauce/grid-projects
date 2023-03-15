export const normalizeAddress = (address) => {
  if (!(!!address)) return null; //throw new Error('');

  let addr = address.toString();

  addr = addr.includes(',') ? addr.replace(',', '_') : address;

  return addr
}

export const pointToAddress = (point = new DOMPoint()) => {
  if (!(!!point)) return null; //throw new Error('');

  return [point.x, point.y].toString().replace(',', '_');
}

export const addressToPoint = (address) => {
  if (!(!!address)) return null; //throw new Error('');

  return (address.includes(',') ? address.replace(',', '_') : address)
  .split('_')
    .map(_ => +_);
}