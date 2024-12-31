
export function unsafeReadUint32(buffer: Buffer, offset: number): [number, number] {
    const value = buffer.readUInt32LE(offset);
    offset += 4;
    return [value, offset];
}

export function readVarString(buffer: Buffer, offset: number): [string, number] {
    const length = buffer.readUInt8(offset);
    const string = buffer.subarray(offset + 1, offset + 1 + length).toString('utf8');
    return [string, offset + 1 + length];
}

export function readFixedList(buffer: Buffer, offset: number, length: number): number[] {
    const list: number[] = [];
    for (let i = 0; i < length; i++) {
      list.push(buffer.readUInt8(offset + i));
    }
    return list;
}
  
export function convertByteListToInt(byteList: number[]): number[] {
    return byteList.map(byte => byte);
}
  