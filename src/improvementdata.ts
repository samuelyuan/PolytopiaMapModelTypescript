import {
  convertByteList,
  convertInt16Bytes, 
  convertUint16Bytes,
  convertVarString 
} from './writer';

export interface ImprovementData {
  level: number;
  foundedTurn: number;
  currentPopulation: number;
  totalPopulation: number;
  production: number;
  baseScore: number;
  borderSize: number;
  upgradeCount: number;
  connectedPlayerCapital: number;
  hasCityName: number;
  cityName: string;
  foundedTribe: number;
  cityRewards: number[];
  rebellionFlag: number;
  rebellionBuffer: number[];
}

export function deserializeImprovementDataFromBytes(buffer: Buffer, offset: number): [ImprovementData, number] {
  const level = buffer.readUInt16LE(offset);
  offset += 2;
  const foundedTurn = buffer.readUInt16LE(offset);
  offset += 2;
  const currentPopulation = buffer.readInt16LE(offset);
  offset += 2;
  const totalPopulation = buffer.readUInt16LE(offset);
  offset += 2;
  const production = buffer.readInt16LE(offset);
  offset += 2;
  const baseScore = buffer.readInt16LE(offset);
  offset += 2;
  const borderSize = buffer.readInt16LE(offset);
  offset += 2;
  const upgradeCount = buffer.readInt16LE(offset);
  offset += 2;
  const connectedPlayerCapital = buffer.readUInt8(offset);
  offset += 1;
  const hasCityName = buffer.readUInt8(offset);
  offset += 1;
  let cityName = '';
  if (hasCityName === 1) {
    const cityNameLength = buffer.readUInt8(offset);
    offset += 1;
    cityName = buffer.toString('utf8', offset, offset + cityNameLength);
    offset += cityNameLength;
  }
  const foundedTribe = buffer.readUInt8(offset);
  offset += 1;
  const cityRewardsSize = buffer.readUInt16LE(offset);
  offset += 2;
  const cityRewards: number[] = [];
  for (let i = 0; i < cityRewardsSize; i++) {
    cityRewards.push(buffer.readUInt16LE(offset));
    offset += 2;
  }
  const rebellionFlag = buffer.readUInt16LE(offset);
  offset += 2;
  const rebellionBuffer: number[] = [];
  if (rebellionFlag !== 0) {
    const rebellionBufferSize = buffer.readUInt16LE(offset);
    offset += 2;
    for (let i = 0; i < rebellionBufferSize; i++) {
      rebellionBuffer.push(buffer.readUInt8(offset));
      offset += 1;
    }
  }

  const improvementData: ImprovementData = {
    level,
    foundedTurn,
    currentPopulation,
    totalPopulation,
    production,
    baseScore,
    borderSize,
    upgradeCount,
    connectedPlayerCapital,
    hasCityName,
    cityName,
    foundedTribe,
    cityRewards,
    rebellionFlag,
    rebellionBuffer,
  };
  return [improvementData, offset];
}

export function serializeImprovementDataToBytes(improvementData: ImprovementData): Buffer {
  let data = Buffer.alloc(0);
  data = Buffer.concat([data, convertUint16Bytes(improvementData.level)]);
  data = Buffer.concat([data, convertUint16Bytes(improvementData.foundedTurn)]);
  data = Buffer.concat([data, convertUint16Bytes(improvementData.currentPopulation)]);
  data = Buffer.concat([data, convertUint16Bytes(improvementData.totalPopulation)]);
  data = Buffer.concat([data, convertUint16Bytes(improvementData.production)]);
  data = Buffer.concat([data, convertUint16Bytes(improvementData.baseScore)]);
  data = Buffer.concat([data, convertUint16Bytes(improvementData.borderSize)]);
  data = Buffer.concat([data, convertInt16Bytes(improvementData.upgradeCount)]);
  data = Buffer.concat([data, Buffer.from([improvementData.connectedPlayerCapital])]);
  data = Buffer.concat([data, Buffer.from([improvementData.hasCityName])]);
  if (improvementData.hasCityName === 1) {
    data = Buffer.concat([data, convertVarString(improvementData.cityName)]);
  }
  data = Buffer.concat([data, Buffer.from([improvementData.foundedTribe])]);
  data = Buffer.concat([data, convertUint16Bytes(improvementData.cityRewards.length)]);
  for (const reward of improvementData.cityRewards) {
    data = Buffer.concat([data, convertUint16Bytes(reward)]);
  }
  data = Buffer.concat([data, convertUint16Bytes(improvementData.rebellionFlag)]);
  if (improvementData.rebellionFlag !== 0) {
    data = Buffer.concat([data, convertByteList(improvementData.rebellionBuffer)]);
  }
  return data;
}
