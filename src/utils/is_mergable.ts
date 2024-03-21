interface setting_object {
    [key:string]:any,
    [key:number]:any
}
export function isMergeable(source: setting_object, target: setting_object): boolean {
    // Check if both are objects (not arrays or other types)
    if (typeof source !== 'object' || source === null || typeof target !== 'object' || target === null) {
      return false;
    }
  
    // Iterate through source object keys
    for (const key in source) {
      // Check if key exists in target
      if (!target.hasOwnProperty(key)) {
        return false;
      }
  
      // Check if value types match (recursive check for nested objects)
      const sourceValue = source[key];
      const targetValue = target[key];
      const sourceValueType = typeof sourceValue;
      const targetValueType = typeof targetValue;
  
      if (sourceValueType === 'object' && targetValueType === 'object') {
        // Recursive check for nested objects
        if (!isMergeable(sourceValue, targetValue)) {
          return false;
        }
      } else if (sourceValueType !== targetValueType) {
        return false;
      }
    }
  
    // If all checks pass, objects are mergeable
    return true;
  }
  
  // Example usage
  const sourceObj = {
    name: 'John',
    address: {
      street: '123 Main St',
      city: 'Anytown',
    },
  };
  
  const targetObj = {
    name: 'John', // Key must exist
    age: 30,      // Can have additional keys
    address: {
      street: '',  // Value type must match
      city: 'Anytown',
    },
  };
  
  if (isMergeable(sourceObj, targetObj)) {
    console.log('Objects are mergeable');
  } else {
    console.log('Objects are not mergeable');
  }
  