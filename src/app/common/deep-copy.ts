export const deepCopy = <T>(obj: T): T => {
  if (!(typeof obj === 'object' && obj)) { return obj; }

  if (Array.isArray(obj)) {
    // @ts-ignore
    const newArr: T = [];
    const arrLength = obj.length;

    for (let i = 0; i < arrLength; i = (i + 1) | 0) {
      const prop = obj[i];
      // @ts-ignore
      newArr[i] = deepCopy(prop);
    }

    // @ts-ignore
    return [...newArr];
  } else {
    // @ts-ignore
    const newObj: T = {};
    const keys = Object.keys(obj);
    const keyLength = keys.length;

    for (let i = 0; i < keyLength; i = (i + 1) | 0) {
      const key = keys[i];
      // @ts-ignore
      const prop = obj[key];
      // @ts-ignore
      newObj[key] = deepCopy(prop);
    }

    return { ...newObj };
  }
};
