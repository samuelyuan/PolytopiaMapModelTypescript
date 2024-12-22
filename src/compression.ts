import { Buffer } from 'buffer';
import * as fs from 'fs';
import * as lz4 from 'lz4';

export function decompressPolytopiaFile(inputFilename: string) {
  const inputFile = fs.readFileSync(inputFilename);
  const inputBytes = Buffer.from(inputFile);
  const firstByte = inputBytes[0];
  let sizeOfDiff = (firstByte >> 6) & 3;
  if (sizeOfDiff === 3) {
    sizeOfDiff = 4;
  }
  const dataOffset = 1 + sizeOfDiff;
  let resultDiff: number;
  if (sizeOfDiff === 4) {
    resultDiff = inputBytes.readUInt32LE(1);
  } else if (sizeOfDiff === 2) {
    resultDiff = inputBytes.readUInt16LE(1);
  } else {
    throw new Error(`Header sizeOfDiff is unrecognized value: ${sizeOfDiff}`);
  }
  const dataLength = inputBytes.length - dataOffset;
  const resultLength = dataLength + resultDiff;

  // decompress
  const decompressedContents = Buffer.alloc(resultLength);
  const decompressedLength = lz4.decodeBlock(inputBytes.slice(dataOffset), decompressedContents);

  const decompressedFilename = `${inputFilename}.decomp`;
  fs.writeFileSync(decompressedFilename, decompressedContents.slice(0, decompressedLength));
}

export function compressPolytopiaFile(inputFilename: string, outputFilename: string) {
  const inputFile = fs.readFileSync(inputFilename);
  const inputBytes = Buffer.from(inputFile);

  const decompressedLength = inputBytes.length;
  const compressedContents = Buffer.alloc(decompressedLength);
  const compressedLength = lz4.encodeBlock(inputBytes, compressedContents);

  let newCompressedContents: Buffer;
  if (decompressedLength >= 65536) {
    const byteArrDecompressedSize = Buffer.alloc(4);
    byteArrDecompressedSize.writeUInt32LE(decompressedLength - compressedLength, 0);

    newCompressedContents = Buffer.concat([Buffer.from([0xC0]), byteArrDecompressedSize, compressedContents.slice(0, compressedLength)]);
  } else {
    const byteArrDecompressedSize = Buffer.alloc(2);
    byteArrDecompressedSize.writeUInt16LE(decompressedLength - compressedLength, 0);

    newCompressedContents = Buffer.concat([Buffer.from([0x80]), byteArrDecompressedSize, compressedContents.slice(0, compressedLength)]);
  }

  fs.writeFileSync(outputFilename, newCompressedContents);
}