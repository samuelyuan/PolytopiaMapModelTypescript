import { readVarString } from './reader';

interface MapHeaderInput {
    version1: number;
    version2: number;
    totalActions: number;
    currentTurn: number;
    currentPlayerIndex: number;
    maxUnitId: number;
    currentGameState: number;
    seed: number;
    turnLimit: number;
    scoreLimit: number;
    winByCapital: number;
    unknownSettings: Uint8Array;
    gameModeBase: number;
    gameModeRules: number;
}

interface TribeSkin {
    tribe: number;
    skin: number;
}

export interface MapHeaderOutput {
    mapHeaderInput: MapHeaderInput;
    mapName: string;
    mapSquareSize: number;
    disabledTribesArr: number[];
    unlockedTribesArr: number[];
    gameDifficulty: number;
    numOpponents: number;
    gameType: number;
    mapPreset: number;
    turnTimeLimitMinutes: number;
    unknownFloat1: number;
    unknownFloat2: number;
    baseTimeSeconds: number;
    timeSettings: number[];
    selectedTribeSkins: TribeSkin[];
    mapWidth: number;
    mapHeight: number;
}

function readFixedList(buffer: DataView, offset: number, length: number): number[] {
    const list = [];
    for (let i = 0; i < length; i++) {
        list.push(buffer.getUint8(offset));
        offset += 1;
    }
    return list;
}

export function deserializeMapHeaderFromBytes(buffer: Buffer, offset: number): [MapHeaderOutput, number] {
    const mapHeaderInput: MapHeaderInput = {
        version1: buffer.readUInt32LE(offset),
        version2: buffer.readUInt32LE(offset += 4),
        totalActions: buffer.readUInt16LE(offset += 4),
        currentTurn: buffer.readUInt32LE(offset += 2),
        currentPlayerIndex: buffer.readUInt8(offset += 4),
        maxUnitId: buffer.readUInt32LE(offset += 1),
        currentGameState: buffer.readUInt8(offset += 4),
        seed: buffer.readInt32LE(offset += 1),
        turnLimit: buffer.readUInt32LE(offset += 4),
        scoreLimit: buffer.readUInt32LE(offset += 4),
        winByCapital: buffer.readUInt8(offset += 4),
        unknownSettings: buffer.subarray(offset += 1, offset + 6),
        gameModeBase: buffer.readUInt8(offset += 6),
        gameModeRules: buffer.readUInt8(offset += 1),
    };
    offset += 1;

    const [mapName, newOffset] = readVarString(buffer, offset);
    offset = newOffset;

    const mapSquareSize = buffer.readUInt32LE(offset);
    offset += 4;

    const disabledTribesSize = buffer.readUInt16LE(offset);
    offset += 2;
    const disabledTribesArr = [];
    for (let i = 0; i < disabledTribesSize; i++) {
        disabledTribesArr.push(buffer.readUInt16LE(offset));
        offset += 2;
    }

    const unlockedTribesSize = buffer.readUInt16LE(offset);
    offset += 2;
    const unlockedTribesArr = [];
    for (let i = 0; i < unlockedTribesSize; i++) {
        unlockedTribesArr.push(buffer.readUInt16LE(offset));
        offset += 2;
    }

    const gameDifficulty = buffer.readUInt16LE(offset);
    offset += 2;
    const numOpponents = buffer.readUInt32LE(offset);
    offset += 4;
    const gameType = buffer.readUInt16LE(offset);
    offset += 2;
    const mapPreset = buffer.readUInt8(offset);
    offset += 1;
    const turnTimeLimitMinutes = buffer.readInt32LE(offset);
    offset += 4;
    const unknownFloat1 = buffer.readFloatLE(offset);
    offset += 4;
    const unknownFloat2 = buffer.readFloatLE(offset);
    offset += 4;
    const baseTimeSeconds = buffer.readFloatLE(offset);
    offset += 4;
    const timeSettings = [];
    for (let i = 0; i < 4; i++) {
        timeSettings.push(buffer.readUInt8(offset));
        offset += 1;
    }

    const selectedTribeSkinSize = buffer.readUInt32LE(offset);
    offset += 4;
    const selectedTribeSkins: TribeSkin[] = [];
    for (let i = 0; i < selectedTribeSkinSize; i++) {
        const tribe = buffer.readUInt16LE(offset);
        offset += 2;
        const skin = buffer.readUInt16LE(offset);
        offset += 2;
        selectedTribeSkins.push({ tribe, skin });
    }

    const mapWidth = buffer.readUInt16LE(offset);
    offset += 2;
    const mapHeight = buffer.readUInt16LE(offset);
    offset += 2;

    const mapHeaderOutput: MapHeaderOutput = {
        mapHeaderInput,
        mapName,
        mapSquareSize,
        disabledTribesArr,
        unlockedTribesArr,
        gameDifficulty,
        numOpponents,
        gameType,
        mapPreset,
        turnTimeLimitMinutes,
        unknownFloat1,
        unknownFloat2,
        baseTimeSeconds,
        timeSettings,
        selectedTribeSkins,
        mapWidth,
        mapHeight,
    };
    return [mapHeaderOutput, offset];
}

export function serializeMapHeaderToBytes(mapHeaderOutput: MapHeaderOutput): ArrayBuffer {
    const buffer = new ArrayBuffer(1024); // Adjust size as needed
    const dataView = new DataView(buffer);
    let offset = 0;

    const mapHeaderInput = mapHeaderOutput.mapHeaderInput;
    dataView.setUint32(offset, mapHeaderInput.version1, true);
    dataView.setUint32(offset += 4, mapHeaderInput.version2, true);
    dataView.setUint16(offset += 4, mapHeaderInput.totalActions, true);
    dataView.setUint32(offset += 2, mapHeaderInput.currentTurn, true);
    dataView.setUint8(offset += 4, mapHeaderInput.currentPlayerIndex);
    dataView.setUint32(offset += 1, mapHeaderInput.maxUnitId, true);
    dataView.setUint8(offset += 4, mapHeaderInput.currentGameState);
    dataView.setInt32(offset += 1, mapHeaderInput.seed, true);
    dataView.setUint32(offset += 4, mapHeaderInput.turnLimit, true);
    dataView.setUint32(offset += 4, mapHeaderInput.scoreLimit, true);
    dataView.setUint8(offset += 4, mapHeaderInput.winByCapital);
    new Uint8Array(buffer, offset += 1, 6).set(mapHeaderInput.unknownSettings);
    dataView.setUint8(offset += 6, mapHeaderInput.gameModeBase);
    dataView.setUint8(offset += 1, mapHeaderInput.gameModeRules);

    const mapNameBytes = new TextEncoder().encode(mapHeaderOutput.mapName);
    dataView.setUint8(offset += 1, mapNameBytes.length);
    new Uint8Array(buffer, offset += 1, mapNameBytes.length).set(mapNameBytes);
    offset += mapNameBytes.length;

    dataView.setUint32(offset, mapHeaderOutput.mapSquareSize, true);
    offset += 4;

    dataView.setUint16(offset, mapHeaderOutput.disabledTribesArr.length, true);
    offset += 2;
    for (const tribe of mapHeaderOutput.disabledTribesArr) {
        dataView.setUint16(offset, tribe, true);
        offset += 2;
    }

    dataView.setUint16(offset, mapHeaderOutput.unlockedTribesArr.length, true);
    offset += 2;
    for (const tribe of mapHeaderOutput.unlockedTribesArr) {
        dataView.setUint16(offset, tribe, true);
        offset += 2;
    }

    dataView.setUint16(offset, mapHeaderOutput.gameDifficulty, true);
    offset += 2;
    dataView.setUint32(offset, mapHeaderOutput.numOpponents, true);
    offset += 4;
    dataView.setUint16(offset, mapHeaderOutput.gameType, true);
    offset += 2;
    dataView.setUint8(offset, mapHeaderOutput.mapPreset);
    offset += 1;
    dataView.setInt32(offset, mapHeaderOutput.turnTimeLimitMinutes, true);
    offset += 4;
    dataView.setFloat32(offset, mapHeaderOutput.unknownFloat1, true);
    offset += 4;
    dataView.setFloat32(offset, mapHeaderOutput.unknownFloat2, true);
    offset += 4;
    dataView.setFloat32(offset, mapHeaderOutput.baseTimeSeconds, true);
    offset += 4;
    for (const timeSetting of mapHeaderOutput.timeSettings) {
        dataView.setUint8(offset, timeSetting);
        offset += 1;
    }

    dataView.setUint32(offset, mapHeaderOutput.selectedTribeSkins.length, true);
    offset += 4;
    for (const tribeSkin of mapHeaderOutput.selectedTribeSkins) {
        dataView.setUint16(offset, tribeSkin.tribe, true);
        offset += 2;
        dataView.setUint16(offset, tribeSkin.skin, true);
        offset += 2;
    }

    dataView.setUint16(offset, mapHeaderOutput.mapWidth, true);
    offset += 2;
    dataView.setUint16(offset, mapHeaderOutput.mapHeight, true);
    offset += 2;

    return buffer.slice(0, offset);
}
