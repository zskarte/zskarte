const handler = {
  get: (target, prop) => {
    if (prop === "__esModule") return true;
    if (!(prop in target)) {
      target[prop] = () => {};
    }
    return target[prop];
  },
  apply: () => {},
};

const proxy = new Proxy(() => {}, handler);

export default proxy;