import { deserializeImprovementDataFromBytes, serializeImprovementDataToBytes, ImprovementData } from "./improvementdata";
import { convertUint32Bytes, convertInt32Bytes, convertUint16Bytes, convertBoolToByte, convertByteList } from './writer';

interface TileDataHeader {
  worldCoordinates: [number, number];
  terrain: number;
  climate: number;
  altitude: number;
  owner: number;
  capital: number;
  capitalCoordinates: [number, number];
}

export interface TileData {
  worldCoordinates: [number, number];
  terrain: number;
  climate: number;
  altitude: number;
  owner: number;
  capital: number;
  capitalCoordinates: [number, number];
  resourceExists: boolean;
  resourceType: number;
  improvementExists: boolean;
  improvementType: number;
  improvementData: ImprovementData | null;
  unit: UnitData | null;
  passengerUnit: UnitData | null;
  unitEffectData: number[];
  unitDirectionData: number[];
  passengerUnitEffectData: number[];
  passengerUnitDirectionData: number[];
  playerVisibility: number[];
  hasRoad: boolean;
  hasWaterRoute: boolean;
  tileSkin: number;
  unknown: number[];
  floodedFlag: number;
  floodedValue: number;
}

export interface UnitData {
  id: number;
  owner: number;
  unitType: number;
  followerUnitId: number;
  leaderUnitId: number;
  currentCoordinates: [number, number];
  homeCoordinates: [number, number];
  health: number;
  promotionLevel: number;
  experience: number;
  moved: boolean;
  attacked: boolean;
  flipped: boolean;
  createdTurn: number;
}

export function deserializeTileDataFromBytes(buffer: Buffer, offset: number, expectedRow: number, expectedCol: number, gameVersion: number): [TileData, number] {
  const tileDataHeader: TileDataHeader = {
    worldCoordinates: [buffer.readUInt32LE(offset), buffer.readUInt32LE(offset + 4)],
    terrain: buffer.readUInt16LE(offset + 8),
    climate: buffer.readUInt16LE(offset + 10),
    altitude: buffer.readInt16LE(offset + 12),
    owner: buffer.readUInt8(offset + 14),
    capital: buffer.readUInt8(offset + 15),
    capitalCoordinates: [buffer.readInt32LE(offset + 16), buffer.readInt32LE(offset + 20)],
  };

  // Sanity check
  if (tileDataHeader.worldCoordinates[0] !== expectedCol || tileDataHeader.worldCoordinates[1] !== expectedRow) {
    throw new Error(`File reached unexpected location. Iteration (${expectedRow}, ${expectedCol}) isn't equal to world coordinates (${tileDataHeader.worldCoordinates[0]}, ${tileDataHeader.worldCoordinates[1]})`);
  }

  let currentOffset = offset + 24;
  const resourceExistsFlag = buffer.readUInt8(currentOffset++);
  let resourceType = -1;
  if (resourceExistsFlag === 1) {
    resourceType = buffer.readUInt16LE(currentOffset);
    currentOffset += 2;
  }

  const improvementExistsFlag = buffer.readUInt8(currentOffset++);
  let improvementType = -1;
  let improvementDataPtr: ImprovementData | null = null;
  if (improvementExistsFlag === 1) {
    improvementType = buffer.readUInt16LE(currentOffset);
    currentOffset += 2;
    [improvementDataPtr, currentOffset] = deserializeImprovementDataFromBytes(buffer, currentOffset);
  }

  const hasUnitFlag = buffer.readUInt8(currentOffset++);
  let unitDataPtr: UnitData | null = null;
  let passengerUnitDataPtr: UnitData | null = null;
  let unitEffectData: number[] = [];
  let unitDirectionData: number[] = [];
  let passengerUnitEffectData: number[] = [];
  let passengerUnitDirectionData: number[] = [];

  if (hasUnitFlag === 1) {
    [unitDataPtr, currentOffset] = deserializeUnitDataFromBytes(buffer, currentOffset);

    const hasOtherUnitFlag = buffer.readUInt8(currentOffset++);
    if (hasOtherUnitFlag === 1) {
      [passengerUnitDataPtr, currentOffset] = deserializeUnitDataFromBytes(buffer, currentOffset);

      const unknownFlag = buffer.readUInt8(currentOffset++);
      if (unknownFlag !== 0) {
        throw new Error("Passenger unit's other unit flag isn't zero");
      }

      const passengerUnitEffectCount = buffer.readUInt16LE(currentOffset);
      currentOffset += 2;
      for (let i = 0; i < passengerUnitEffectCount; i++) {
        passengerUnitEffectData.push(buffer.readUInt16LE(currentOffset));
        currentOffset += 2;
      }
      passengerUnitDirectionData = readFixedList(buffer, currentOffset, 5);
      currentOffset += 5;

      const unitEffectCount = buffer.readUInt16LE(currentOffset);
      currentOffset += 2;
      for (let i = 0; i < unitEffectCount; i++) {
        unitEffectData.push(buffer.readUInt16LE(currentOffset));
        currentOffset += 2;
      }
      unitDirectionData = readFixedList(buffer, currentOffset, 5);
      currentOffset += 5;
    } else {
      const unitEffectCount = buffer.readUInt16LE(currentOffset);
      currentOffset += 2;
      for (let i = 0; i < unitEffectCount; i++) {
        unitEffectData.push(buffer.readUInt16LE(currentOffset));
        currentOffset += 2;
      }
      unitDirectionData = readFixedList(buffer, currentOffset, 5);
      currentOffset += 5;
    }
  }

  const playerVisibilityListSize = buffer.readUInt8(currentOffset++);
  const playerVisibilityList = convertByteListToInt(readFixedList(buffer, currentOffset, playerVisibilityListSize));
  currentOffset += playerVisibilityListSize;

  const hasRoad = buffer.readUInt8(currentOffset++);
  const hasWaterRoute = buffer.readUInt8(currentOffset++);
  const tileSkin = buffer.readUInt16LE(currentOffset);
  currentOffset += 2;
  const unknown = convertByteListToInt(readFixedList(buffer, currentOffset, 2));
  currentOffset += 2;

  let floodedFlag = 0;
  let floodedValue = 0;
  if (gameVersion >= 105) {
    floodedFlag = buffer.readUInt8(currentOffset++);
    if (floodedFlag === 1) {
      floodedValue = buffer.readUInt32LE(currentOffset);
      currentOffset += 4;
    }
  }

  const tileData: TileData = {
    worldCoordinates: [tileDataHeader.worldCoordinates[0], tileDataHeader.worldCoordinates[1]],
    terrain: tileDataHeader.terrain,
    climate: tileDataHeader.climate,
    altitude: tileDataHeader.altitude,
    owner: tileDataHeader.owner,
    capital: tileDataHeader.capital,
    capitalCoordinates: [tileDataHeader.capitalCoordinates[0], tileDataHeader.capitalCoordinates[1]],
    resourceExists: resourceExistsFlag !== 0,
    resourceType: resourceType,
    improvementExists: improvementExistsFlag !== 0,
    improvementType: improvementType,
    improvementData: improvementDataPtr,
    unit: unitDataPtr,
    passengerUnit: passengerUnitDataPtr,
    unitEffectData: unitEffectData,
    unitDirectionData: unitDirectionData,
    passengerUnitEffectData: passengerUnitEffectData,
    passengerUnitDirectionData: passengerUnitDirectionData,
    playerVisibility: playerVisibilityList,
    hasRoad: hasRoad !== 0,
    hasWaterRoute: hasWaterRoute !== 0,
    tileSkin: tileSkin,
    unknown: unknown,
    floodedFlag: floodedFlag,
    floodedValue: floodedValue,
  };

  return [tileData, currentOffset]
}

export function serializeTileToBytes(tileData: TileData, gameVersion: number): Buffer {
  let tileBytes = Buffer.alloc(0);

  const headerBytes = Buffer.concat([
    convertUint32Bytes(tileData.worldCoordinates[0]),
    convertUint32Bytes(tileData.worldCoordinates[1]),
    convertUint16Bytes(tileData.terrain),
    convertUint16Bytes(tileData.climate),
    convertUint16Bytes(tileData.altitude),
    Buffer.from([tileData.owner]),
    Buffer.from([tileData.capital]),
    convertInt32Bytes(tileData.capitalCoordinates[0]),
    convertInt32Bytes(tileData.capitalCoordinates[1]),
  ]);
  tileBytes = Buffer.concat([tileBytes, headerBytes]);

  if (tileData.resourceExists) {
    tileBytes = Buffer.concat([tileBytes, Buffer.from([1]), convertUint16Bytes(tileData.resourceType)]);
  } else {
    tileBytes = Buffer.concat([tileBytes, Buffer.from([0])]);
  }

  if (tileData.improvementExists) {
    tileBytes = Buffer.concat([tileBytes, Buffer.from([1]), convertUint16Bytes(tileData.improvementType)]);
  } else {
    tileBytes = Buffer.concat([tileBytes, Buffer.from([0])]);
  }

  if (tileData.improvementData) {
    tileBytes = Buffer.concat([tileBytes, serializeImprovementDataToBytes(tileData.improvementData)]);
  }

  if (tileData.unit) {
    tileBytes = Buffer.concat([tileBytes, Buffer.from([1]), serializeUnitDataToBytes(tileData.unit)]);

    if (tileData.passengerUnit) {
      tileBytes = Buffer.concat([tileBytes, Buffer.from([1]), serializeUnitDataToBytes(tileData.passengerUnit), Buffer.from([0])]);

      tileBytes = Buffer.concat([tileBytes, convertUint16Bytes(tileData.passengerUnitEffectData.length)]);
      for (const effect of tileData.passengerUnitEffectData) {
        tileBytes = Buffer.concat([tileBytes, convertUint16Bytes(effect)]);
      }
      tileBytes = Buffer.concat([tileBytes, convertByteList(tileData.passengerUnitDirectionData)]);

      tileBytes = Buffer.concat([tileBytes, convertUint16Bytes(tileData.unitEffectData.length)]);
      for (const effect of tileData.unitEffectData) {
        tileBytes = Buffer.concat([tileBytes, convertUint16Bytes(effect)]);
      }
      tileBytes = Buffer.concat([tileBytes, convertByteList(tileData.unitDirectionData)]);
    } else {
      tileBytes = Buffer.concat([tileBytes, Buffer.from([0]), convertUint16Bytes(tileData.unitEffectData.length)]);
      for (const effect of tileData.unitEffectData) {
        tileBytes = Buffer.concat([tileBytes, convertUint16Bytes(effect)]);
      }
      tileBytes = Buffer.concat([tileBytes, convertByteList(tileData.unitDirectionData)]);
    }
  } else {
    tileBytes = Buffer.concat([tileBytes, Buffer.from([0])]);
  }

  tileBytes = Buffer.concat([
    tileBytes,
    Buffer.from([tileData.playerVisibility.length]),
    convertByteList(tileData.playerVisibility),
    Buffer.from([convertBoolToByte(tileData.hasRoad)]),
    Buffer.from([convertBoolToByte(tileData.hasWaterRoute)]),
    convertUint16Bytes(tileData.tileSkin),
    convertByteList(tileData.unknown),
  ]);

  if (gameVersion >= 105) {
    tileBytes = Buffer.concat([tileBytes, Buffer.from([tileData.floodedFlag])]);
    if (tileData.floodedFlag === 1) {
      tileBytes = Buffer.concat([tileBytes, convertUint32Bytes(tileData.floodedValue)]);
    }
  }

  return tileBytes;
}

export function serializeUnitDataToBytes(unitData: UnitData): Buffer {
  return Buffer.concat([
    convertUint32Bytes(unitData.id),
    Buffer.from([unitData.owner]),
    convertUint16Bytes(unitData.unitType),
    convertUint32Bytes(unitData.followerUnitId),
    convertUint32Bytes(unitData.leaderUnitId),
    convertUint32Bytes(unitData.currentCoordinates[0]),
    convertUint32Bytes(unitData.currentCoordinates[1]),
    convertUint32Bytes(unitData.homeCoordinates[0]),
    convertUint32Bytes(unitData.homeCoordinates[1]),
    convertUint16Bytes(unitData.health),
    convertUint16Bytes(unitData.promotionLevel),
    convertUint16Bytes(unitData.experience),
    Buffer.from([convertBoolToByte(unitData.moved)]),
    Buffer.from([convertBoolToByte(unitData.attacked)]),
    Buffer.from([convertBoolToByte(unitData.flipped)]),
    convertUint16Bytes(unitData.createdTurn),
  ]);
}

// Helper functions
function readFixedList(buffer: Buffer, offset: number, length: number): number[] {
  const list: number[] = [];
  for (let i = 0; i < length; i++) {
    list.push(buffer.readUInt8(offset + i));
  }
  return list;
}

function convertByteListToInt(byteList: number[]): number[] {
  return byteList.map(byte => byte);
}

export function deserializeUnitDataFromBytes(buffer: Buffer, offset: number): [UnitData, number] {
  const id = buffer.readUInt32LE(offset);
  offset += 4;
  const owner = buffer.readUInt8(offset);
  offset += 1;
  const unitType = buffer.readUInt16LE(offset);
  offset += 2;
  const followerUnitId = buffer.readUInt32LE(offset);
  offset += 4;
  const leaderUnitId = buffer.readUInt32LE(offset);
  offset += 4;
  const currentCoordinates: [number, number] = [buffer.readUInt32LE(offset), buffer.readUInt32LE(offset + 4)];
  offset += 8;
  const homeCoordinates: [number, number] = [buffer.readUInt32LE(offset), buffer.readUInt32LE(offset + 4)];
  offset += 8;
  const health = buffer.readUInt16LE(offset);
  offset += 2;
  const promotionLevel = buffer.readUInt16LE(offset);
  offset += 2;
  const experience = buffer.readUInt16LE(offset);
  offset += 2;
  const moved = buffer.readUInt8(offset) !== 0;
  offset += 1;
  const attacked = buffer.readUInt8(offset) !== 0;
  offset += 1;
  const flipped = buffer.readUInt8(offset) !== 0;
  offset += 1;
  const createdTurn = buffer.readUInt16LE(offset);
  offset += 2;

  const unitData: UnitData = {
    id,
    owner,
    unitType,
    followerUnitId,
    leaderUnitId,
    currentCoordinates,
    homeCoordinates,
    health,
    promotionLevel,
    experience,
    moved,
    attacked,
    flipped,
    createdTurn,
  };
  return [unitData, offset];
}
