// ../../node_modules/ol/array.js
function binarySearch(haystack, needle, comparator) {
  let mid, cmp;
  comparator = comparator || ascending;
  let low = 0;
  let high = haystack.length;
  let found = false;
  while (low < high) {
    mid = low + (high - low >> 1);
    cmp = +comparator(haystack[mid], needle);
    if (cmp < 0) {
      low = mid + 1;
    } else {
      high = mid;
      found = !cmp;
    }
  }
  return found ? low : ~low;
}
function ascending(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}
function descending(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
}
function linearFindNearest(arr, target, direction) {
  if (arr[0] <= target) {
    return 0;
  }
  const n = arr.length;
  if (target <= arr[n - 1]) {
    return n - 1;
  }
  if (typeof direction === "function") {
    for (let i = 1; i < n; ++i) {
      const candidate = arr[i];
      if (candidate === target) {
        return i;
      }
      if (candidate < target) {
        if (direction(target, arr[i - 1], candidate) > 0) {
          return i - 1;
        }
        return i;
      }
    }
    return n - 1;
  }
  if (direction > 0) {
    for (let i = 1; i < n; ++i) {
      if (arr[i] < target) {
        return i - 1;
      }
    }
    return n - 1;
  }
  if (direction < 0) {
    for (let i = 1; i < n; ++i) {
      if (arr[i] <= target) {
        return i;
      }
    }
    return n - 1;
  }
  for (let i = 1; i < n; ++i) {
    if (arr[i] == target) {
      return i;
    }
    if (arr[i] < target) {
      if (arr[i - 1] - target < target - arr[i]) {
        return i - 1;
      }
      return i;
    }
  }
  return n - 1;
}
function reverseSubArray(arr, begin, end) {
  while (begin < end) {
    const tmp = arr[begin];
    arr[begin] = arr[end];
    arr[end] = tmp;
    ++begin;
    --end;
  }
}
function extend(arr, data) {
  const extension = Array.isArray(data) ? data : [data];
  const length = extension.length;
  for (let i = 0; i < length; i++) {
    arr[arr.length] = extension[i];
  }
}
function equals(arr1, arr2) {
  const len1 = arr1.length;
  if (len1 !== arr2.length) {
    return false;
  }
  for (let i = 0; i < len1; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}
function isSorted(arr, func, strict) {
  const compare = func || ascending;
  return arr.every(function(currentVal, index) {
    if (index === 0) {
      return true;
    }
    const res = compare(arr[index - 1], currentVal);
    return !(res > 0 || strict && res === 0);
  });
}

export {
  binarySearch,
  ascending,
  descending,
  linearFindNearest,
  reverseSubArray,
  extend,
  equals,
  isSorted
};
//# sourceMappingURL=chunk-LBIH33AC.js.map
