import { readVarString } from './reader';
import { convertInt32Bytes, convertUint32Bytes, convertUint16Bytes } from './writer';

export interface PlayerData {
  playerId: number;
  name: string;
  accountId: string;
  autoPlay: boolean;
  startTileCoordinates: [number, number];
  tribe: number;
  unknownByte1: number;
  difficultyHandicap: number;
  aggressionsByPlayers: PlayerAggression[];
  currency: number;
  score: number;
  unknownInt2: number;
  numCities: number;
  availableTech: number[];
  encounteredPlayers: number[];
  tasks: PlayerTaskData[];
  totalUnitsKilled: number;
  totalUnitsLost: number;
  totalTribesDestroyed: number;
  overrideColor: number[];
  overrideTribe: number;
  uniqueImprovements: number[];
  diplomacyArr: DiplomacyData[];
  diplomacyMessages: DiplomacyMessage[];
  destroyedByTribe: number;
  destroyedTurn: number;
  unknownBuffer2: number[];
  endScore: number;
  playerSkin: number;
  unknownBuffer3: number[];
}

interface PlayerAggression {
  playerId: number;
  aggression: number;
}

interface PlayerTaskData {
  type: number;
  buffer: number[];
}

interface DiplomacyMessage {
  messageType: number;
  sender: number;
}

interface DiplomacyData {
  playerId: number;
  diplomacyRelationState: number;
  lastAttackTurn: number;
  embassyLevel: number;
  lastPeaceBrokenTurn: number;
  firstMeet: number;
  embassyBuildTurn: number;
  previousAttackTurn: number;
}

function readUint8(buffer: Buffer, offset: number): number {
  return buffer.readUInt8(offset);
}

function readUint16(buffer: Buffer, offset: number): number {
  return buffer.readUInt16LE(offset);
}

function readUint32(buffer: Buffer, offset: number): number {
  return buffer.readUInt32LE(offset);
}

function readInt32(buffer: Buffer, offset: number): number {
  return buffer.readInt32LE(offset);
}

function readFixedList(buffer: Buffer, offset: number, length: number): Buffer {
  return buffer.slice(offset, offset + length);
}

function convertByteListToInt(buffer: Buffer): number[] {
  const result: number[] = [];
  for (let i = 0; i < buffer.length; i++) {
    result.push(buffer.readUInt8(i));
  }
  return result;
}

export function deserializePlayerDataFromBytes(buffer: Buffer, offset: number): [PlayerData, number] {
  const playerId = readUint8(buffer, offset);
  offset += 1;

  let playerName: string;
  let playerAccountId: string;
  let newOffset: number;
  [playerName, newOffset] = readVarString(buffer, offset);
  offset = newOffset;

  [playerAccountId, newOffset] = readVarString(buffer, offset);
  offset = newOffset;

  const autoPlay = readUint8(buffer, offset) !== 0;
  offset += 1;

  const startTileCoordinates1 = readInt32(buffer, offset);
  offset += 4;

  const startTileCoordinates2 = readInt32(buffer, offset);
  offset += 4;

  const tribe = readUint16(buffer, offset);
  offset += 2;

  const unknownByte1 = readUint8(buffer, offset);
  offset += 1;

  const difficultyHandicap = readUint32(buffer, offset);
  offset += 4;

  const unknownArrLen1 = readUint16(buffer, offset);
  offset += 2;

  const aggressionsByPlayers: PlayerAggression[] = [];
  for (let i = 0; i < unknownArrLen1; i++) {
    const playerIdOther = readUint8(buffer, offset);
    offset += 1;

    const aggression = readInt32(buffer, offset);
    offset += 4;

    aggressionsByPlayers.push({ playerId: playerIdOther, aggression });
  }

  const currency = readUint32(buffer, offset);
  offset += 4;

  const score = readUint32(buffer, offset);
  offset += 4;

  const unknownInt2 = readUint32(buffer, offset);
  offset += 4;

  const numCities = readUint16(buffer, offset);
  offset += 2;

  const techArrayLen = readUint16(buffer, offset);
  offset += 2;

  const techArray: number[] = [];
  for (let i = 0; i < techArrayLen; i++) {
    const techType = readUint16(buffer, offset);
    offset += 2;
    techArray.push(techType);
  }

  const encounteredPlayersLen = readUint16(buffer, offset);
  offset += 2;

  const encounteredPlayers: number[] = [];
  for (let i = 0; i < encounteredPlayersLen; i++) {
    const playerId = readUint8(buffer, offset);
    offset += 1;
    encounteredPlayers.push(playerId);
  }

  const numTasks = readUint16(buffer, offset);
  offset += 2;

  const taskArr: PlayerTaskData[] = [];
  for (let i = 0; i < numTasks; i++) {
    const taskType = readUint16(buffer, offset);
    offset += 2;

    let bufferData: Buffer;
    if (taskType === 1 || taskType === 5) {
      bufferData = readFixedList(buffer, offset, 6);
      offset += 6;
    } else if (taskType >= 1 && taskType <= 8) {
      bufferData = readFixedList(buffer, offset, 2);
      offset += 2;
    } else {
      throw new Error(`Invalid task type: ${taskType}`);
    }

    taskArr.push({ type: taskType, buffer: convertByteListToInt(bufferData) });
  }

  const totalKills = readInt32(buffer, offset);
  offset += 4;

  const totalLosses = readInt32(buffer, offset);
  offset += 4;

  const totalTribesDestroyed = readInt32(buffer, offset);
  offset += 4;

  const overrideColor = convertByteListToInt(readFixedList(buffer, offset, 4));
  offset += 4;

  const overrideTribe = readUint8(buffer, offset);
  offset += 1;

  const playerUniqueImprovementsSize = readUint16(buffer, offset);
  offset += 2;

  const playerUniqueImprovements: number[] = [];
  for (let i = 0; i < playerUniqueImprovementsSize; i++) {
    const improvement = readUint16(buffer, offset);
    offset += 2;
    playerUniqueImprovements.push(improvement);
  }

  const diplomacyArrLen = readUint16(buffer, offset);
  offset += 2;

  const diplomacyArr: DiplomacyData[] = [];
  for (let i = 0; i < diplomacyArrLen; i++) {
    const diplomacyData: DiplomacyData = {
      playerId: readUint8(buffer, offset),
      diplomacyRelationState: readUint8(buffer, offset + 1),
      lastAttackTurn: readInt32(buffer, offset + 2),
      embassyLevel: readUint8(buffer, offset + 6),
      lastPeaceBrokenTurn: readInt32(buffer, offset + 7),
      firstMeet: readInt32(buffer, offset + 11),
      embassyBuildTurn: readInt32(buffer, offset + 15),
      previousAttackTurn: readInt32(buffer, offset + 19),
    };
    offset += 23;
    diplomacyArr.push(diplomacyData);
  }

  const diplomacyMessagesSize = readUint16(buffer, offset);
  offset += 2;

  const diplomacyMessagesArr: DiplomacyMessage[] = [];
  for (let i = 0; i < diplomacyMessagesSize; i++) {
    const messageType = readUint8(buffer, offset);
    offset += 1;

    const sender = readUint8(buffer, offset);
    offset += 1;

    diplomacyMessagesArr.push({ messageType, sender });
  }

  const destroyedByTribe = readUint8(buffer, offset);
  offset += 1;

  const destroyedTurn = readUint32(buffer, offset);
  offset += 4;

  const unknownBuffer2 = convertByteListToInt(readFixedList(buffer, offset, 4));
  offset += 4;

  const endScore = readInt32(buffer, offset);
  offset += 4;

  const playerSkin = readUint16(buffer, offset);
  offset += 2;

  const unknownBuffer3 = convertByteListToInt(readFixedList(buffer, offset, 4));
  offset += 4;

  const playerData: PlayerData = {
    playerId,
    name: playerName,
    accountId: playerAccountId,
    autoPlay,
    startTileCoordinates: [startTileCoordinates1, startTileCoordinates2],
    tribe,
    unknownByte1,
    difficultyHandicap,
    aggressionsByPlayers,
    currency,
    score,
    unknownInt2,
    numCities,
    availableTech: techArray,
    encounteredPlayers,
    tasks: taskArr,
    totalUnitsKilled: totalKills,
    totalUnitsLost: totalLosses,
    totalTribesDestroyed,
    overrideColor,
    overrideTribe,
    uniqueImprovements: playerUniqueImprovements,
    diplomacyArr,
    diplomacyMessages: diplomacyMessagesArr,
    destroyedByTribe,
    destroyedTurn,
    unknownBuffer2,
    endScore,
    playerSkin,
    unknownBuffer3,
  };
  return [playerData, offset];
}

export function serializePlayerDataToBytes(playerData: PlayerData): Buffer {
  const bufferArray: Buffer[] = [];

  bufferArray.push(Buffer.from([playerData.playerId]));
  bufferArray.push(Buffer.alloc(1, playerData.name.length));
  bufferArray.push(Buffer.from(playerData.name, 'utf8'));
  bufferArray.push(Buffer.alloc(1, playerData.accountId.length));
  bufferArray.push(Buffer.from(playerData.accountId, 'utf8'));
  bufferArray.push(Buffer.from([playerData.autoPlay ? 1 : 0]));
  bufferArray.push(convertUint32Bytes(playerData.startTileCoordinates[0]));
  bufferArray.push(convertUint32Bytes(playerData.startTileCoordinates[1]));
  bufferArray.push(convertUint16Bytes(playerData.tribe));
  bufferArray.push(Buffer.from([playerData.unknownByte1]));
  bufferArray.push(convertUint32Bytes(playerData.difficultyHandicap));

  bufferArray.push(convertUint16Bytes(playerData.aggressionsByPlayers.length));
  for (const aggression of playerData.aggressionsByPlayers) {
    bufferArray.push(Buffer.from([aggression.playerId]));
    bufferArray.push(convertUint32Bytes(aggression.aggression));
  }

  bufferArray.push(convertUint32Bytes(playerData.currency));
  bufferArray.push(convertUint32Bytes(playerData.score));
  bufferArray.push(convertUint32Bytes(playerData.unknownInt2));
  bufferArray.push(convertUint16Bytes(playerData.numCities));

  bufferArray.push(convertUint16Bytes(playerData.availableTech.length));
  for (const tech of playerData.availableTech) {
    bufferArray.push(convertUint16Bytes(tech));
  }

  bufferArray.push(convertUint16Bytes(playerData.encounteredPlayers.length));
  for (const playerId of playerData.encounteredPlayers) {
    bufferArray.push(Buffer.from([playerId]));
  }

  bufferArray.push(convertUint16Bytes(playerData.tasks.length));
  for (const task of playerData.tasks) {
    bufferArray.push(convertUint16Bytes(task.type));
    bufferArray.push(Buffer.from(task.buffer));
  }

  bufferArray.push(convertUint32Bytes(playerData.totalUnitsKilled));
  bufferArray.push(convertUint32Bytes(playerData.totalUnitsLost));
  bufferArray.push(convertUint32Bytes(playerData.totalTribesDestroyed));
  bufferArray.push(Buffer.from(playerData.overrideColor));
  bufferArray.push(Buffer.from([playerData.overrideTribe]));

  bufferArray.push(convertUint16Bytes(playerData.uniqueImprovements.length));
  for (const improvement of playerData.uniqueImprovements) {
    bufferArray.push(convertUint16Bytes(improvement));
  }

  bufferArray.push(convertUint16Bytes(playerData.diplomacyArr.length));
  for (const diplomacyData of playerData.diplomacyArr) {
    bufferArray.push(serializeDiplomacyDataToBytes(diplomacyData));
  }

  bufferArray.push(convertUint16Bytes(playerData.diplomacyMessages.length));
  for (const message of playerData.diplomacyMessages) {
    bufferArray.push(Buffer.from([message.messageType, message.sender]));
  }

  bufferArray.push(Buffer.from([playerData.destroyedByTribe]));
  bufferArray.push(convertUint32Bytes(playerData.destroyedTurn));
  bufferArray.push(Buffer.from(playerData.unknownBuffer2));
  bufferArray.push(convertInt32Bytes(playerData.endScore));
  bufferArray.push(convertUint16Bytes(playerData.playerSkin));
  bufferArray.push(Buffer.from(playerData.unknownBuffer3));

  return Buffer.concat(bufferArray);
}

function serializeDiplomacyDataToBytes(diplomacyData: DiplomacyData): Buffer {
  const bufferArray: Buffer[] = [];

  bufferArray.push(Buffer.from([diplomacyData.playerId]));
  bufferArray.push(Buffer.from([diplomacyData.diplomacyRelationState]));
  bufferArray.push(convertInt32Bytes(diplomacyData.lastAttackTurn));
  bufferArray.push(Buffer.from([diplomacyData.embassyLevel]));
  bufferArray.push(convertInt32Bytes(diplomacyData.lastPeaceBrokenTurn));
  bufferArray.push(convertInt32Bytes(diplomacyData.firstMeet));
  bufferArray.push(convertInt32Bytes(diplomacyData.embassyBuildTurn));
  bufferArray.push(convertInt32Bytes(diplomacyData.previousAttackTurn));

  return Buffer.concat(bufferArray);
}

export function buildEmptyPlayer(index: number, playerName: string, overrideColor: { r: number, g: number, b: number, a: number }): PlayerData {
  if (index >= 254) {
    throw new Error("Over 255 players");
  }

  const newArraySize = index + 1;
  const aggressionsByPlayers: PlayerAggression[] = [];
  for (let i = 1; i <= newArraySize; i++) {
    let playerId = i;
    if (i === newArraySize) {
      playerId = 255;
    }
    aggressionsByPlayers.push({ playerId, aggression: 0 });
  }

  return {
    playerId: index,
    name: playerName,
    accountId: "00000000-0000-0000-0000-000000000000",
    autoPlay: true,
    startTileCoordinates: [0, 0],
    tribe: 2, // Ai-mo
    unknownByte1: 1,
    difficultyHandicap: 2,
    aggressionsByPlayers,
    currency: 5,
    score: 0,
    unknownInt2: 0,
    numCities: 1,
    availableTech: [],
    encounteredPlayers: [],
    tasks: [],
    totalUnitsKilled: 0,
    totalUnitsLost: 0,
    totalTribesDestroyed: 0,
    overrideColor: [overrideColor.b, overrideColor.g, overrideColor.r, 0],
    overrideTribe: 0,
    uniqueImprovements: [],
    diplomacyArr: [],
    diplomacyMessages: [],
    destroyedByTribe: 0,
    destroyedTurn: 0,
    unknownBuffer2: [255, 255, 255, 255],
    endScore: -1,
    playerSkin: 0,
    unknownBuffer3: [255, 255, 255, 255],
  };
}