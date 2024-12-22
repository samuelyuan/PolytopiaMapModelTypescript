
export function convertUint32Bytes(value: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value, 0);
  return buffer;
}

export function convertInt32Bytes(value: number): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeInt32LE(value, 0);
    return buffer;
  }

export function convertUint16Bytes(value: number): Buffer {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value, 0);
  return buffer;
}

export function convertInt16Bytes(value: number): Buffer {
  const buffer = Buffer.alloc(2);
  buffer.writeInt16LE(value, 0);
  return buffer;
}

function convertFloat32Bytes(value: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeFloatLE(value, 0);
  return buffer;
}

export function convertVarString(value: string): Buffer {
  const lengthBuffer = Buffer.alloc(1);
  lengthBuffer.writeUInt8(value.length, 0);
  const stringBuffer = Buffer.from(value, 'utf8');
  return Buffer.concat([lengthBuffer, stringBuffer]);
}

export function convertByteList(oldArr: number[]): Buffer {
  const buffer = Buffer.alloc(oldArr.length);
  oldArr.forEach((value, index) => {
    buffer.writeUInt8(value, index);
  });
  return buffer;
}

export function convertBoolToByte(value: boolean): number {
  return value ? 1 : 0;
}
