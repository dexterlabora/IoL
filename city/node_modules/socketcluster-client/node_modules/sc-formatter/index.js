var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

module.exports.parse = function (input) {
  if (input == null) {
   return null;
  }
  var message = input.toString();
  
  try {
    return JSON.parse(message);
  } catch (err) {}
  return message;
};

var arrayBufferToBase64 = function (arraybuffer) {
  var bytes = new Uint8Array(arraybuffer);
  var len = bytes.length;
  var base64 = '';

  for (var i = 0; i < len; i += 3) {
    base64 += base64Chars[bytes[i] >> 2];
    base64 += base64Chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64 += base64Chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64 += base64Chars[bytes[i + 2] & 63];
  }

  if ((len % 3) === 2) {
    base64 = base64.substring(0, base64.length - 1) + '=';
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + '==';
  }

  return base64;
};

var isOwnDescendant = function (object, ancestors) {
  for (var i in ancestors) {
    if (ancestors.hasOwnProperty(i)) {
      if (ancestors[i] === object) {
        return true;
      }
    }
  }
  return false;
};

var convertBuffersToBase64 = function (object, ancestors) {
  if (!ancestors) {
    ancestors = [];
  }
  if (isOwnDescendant(object, ancestors)) {
    throw new Error('Cannot traverse circular structure');
  }
  var newAncestors = ancestors.concat([object]);
  
  if (global.ArrayBuffer && object instanceof global.ArrayBuffer) {
    object = {
      base64: true,
      data: arrayBufferToBase64(object)
    };
  } else if (global.Buffer && object instanceof global.Buffer) {
    object = {
      base64: true,
      data: object.toString('base64')
    };
  } else if (object instanceof Array) {
    for (var i in object) {
      if (object.hasOwnProperty(i)) {
        object[i] = convertBuffersToBase64(object[i], newAncestors);
      }
    }
  } else if (object instanceof Object) {
    for (var j in object) {
      if (object.hasOwnProperty(j)) {
        object[j] = convertBuffersToBase64(object[j], newAncestors);
      }
    }
  }
  return object;
};

module.exports.stringify = function (object) {
  var base64Object = convertBuffersToBase64(object);
  return JSON.stringify(base64Object);
};
