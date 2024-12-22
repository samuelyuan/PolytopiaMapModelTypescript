
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