/* eslint-disable @typescript-eslint/no-explicit-any */
export const debounce = (callback: any, wait: number, thisReference: any = null) => {
  let timeoutId: number | undefined = undefined;
  return (...args: any[]) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      // eslint-disable-next-line prefer-spread
      callback.apply(thisReference, args);
    }, wait);
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const debounceLeading = (callback: (...args: any[]) => Promise<boolean>, wait: number, thisReference: any = null) => {
  //call callback immediately if not callen since wait, in other case wait until wait time is over
  let timeoutId: number | undefined;
  let lastArgs: any[] | undefined;
  let lastThisReference: any;
  let lastCallTime = 0;
  let lastStartTime = 0;

  return async (...args: any[]) => {
    const now = Date.now();
    if (now - lastStartTime < 1000) {
      // ignore additional calls in less than 1 sec
      return;
    }
    lastStartTime = now;
    if (!timeoutId && now - lastCallTime > wait) {
      // there's no active timeout and enought time elapsed
      if (await callback.apply(thisReference, args)) {
        // Record the time of the last call if successful
        lastCallTime = now;
      }
      return;
    }
    lastArgs = args;
    lastThisReference = thisReference;
    if (timeoutId) {
      //as there is already a timeout: update args and let it do the work, cancel this call
      return;
    }
    // Calculate remaining wait time
    const restTime = wait - (now - lastCallTime);
    // Start timeout for the remaining wait time
    timeoutId = window.setTimeout(async () => {
      // Call with the latest arguments
      if (await callback.apply(lastThisReference, lastArgs!)) {
        // Update last call time if successful
        lastCallTime = Date.now();
      }
      timeoutId = undefined;
    }, restTime);
  };
};
