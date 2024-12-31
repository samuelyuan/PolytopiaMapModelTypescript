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

export function serializeMapHeaderToBytes(mapHeaderOutput: MapHeaderOutput): Buffer {
    const estimatedSize = 1024 + mapHeaderOutput.mapName.length + mapHeaderOutput.disabledTribesArr.length * 2 + mapHeaderOutput.unlockedTribesArr.length * 2 + mapHeaderOutput.selectedTribeSkins.length * 4;
    const buffer = Buffer.alloc(estimatedSize);
    let offset = 0;

    const mapHeaderInput = mapHeaderOutput.mapHeaderInput;
    buffer.writeUInt32LE(mapHeaderInput.version1, offset);
    buffer.writeUInt32LE(mapHeaderInput.version2, offset += 4);
    buffer.writeUInt16LE(mapHeaderInput.totalActions, offset += 4);
    buffer.writeUInt32LE(mapHeaderInput.currentTurn, offset += 2);
    buffer.writeUInt8(mapHeaderInput.currentPlayerIndex, offset += 4);
    buffer.writeUInt32LE(mapHeaderInput.maxUnitId, offset += 1);
    buffer.writeUInt8(mapHeaderInput.currentGameState, offset += 4);
    buffer.writeInt32LE(mapHeaderInput.seed, offset += 1);
    buffer.writeUInt32LE(mapHeaderInput.turnLimit, offset += 4);
    buffer.writeUInt32LE(mapHeaderInput.scoreLimit, offset += 4);
    buffer.writeUInt8(mapHeaderInput.winByCapital, offset += 4);
    buffer.set(mapHeaderInput.unknownSettings, offset += 1);
    offset += 6;
    buffer.writeUInt8(mapHeaderInput.gameModeBase, offset);
    buffer.writeUInt8(mapHeaderInput.gameModeRules, offset += 1);

    const mapNameBytes = Buffer.from(mapHeaderOutput.mapName, 'utf-8');
    buffer.writeUInt8(mapNameBytes.length, offset += 1);
    mapNameBytes.copy(buffer, offset += 1);
    offset += mapNameBytes.length;

    buffer.writeUInt32LE(mapHeaderOutput.mapSquareSize, offset);
    offset += 4;

    buffer.writeUInt16LE(mapHeaderOutput.disabledTribesArr.length, offset);
    offset += 2;
    for (const tribe of mapHeaderOutput.disabledTribesArr) {
        buffer.writeUInt16LE(tribe, offset);
        offset += 2;
    }

    buffer.writeUInt16LE(mapHeaderOutput.unlockedTribesArr.length, offset);
    offset += 2;
    for (const tribe of mapHeaderOutput.unlockedTribesArr) {
        buffer.writeUInt16LE(tribe, offset);
        offset += 2;
    }

    buffer.writeUInt16LE(mapHeaderOutput.gameDifficulty, offset);
    offset += 2;
    buffer.writeUInt32LE(mapHeaderOutput.numOpponents, offset);
    offset += 4;
    buffer.writeUInt16LE(mapHeaderOutput.gameType, offset);
    offset += 2;
    buffer.writeUInt8(mapHeaderOutput.mapPreset, offset);
    offset += 1;
    buffer.writeInt32LE(mapHeaderOutput.turnTimeLimitMinutes, offset);
    offset += 4;
    buffer.writeFloatLE(mapHeaderOutput.unknownFloat1, offset);
    offset += 4;
    buffer.writeFloatLE(mapHeaderOutput.unknownFloat2, offset);
    offset += 4;
    buffer.writeFloatLE(mapHeaderOutput.baseTimeSeconds, offset);
    offset += 4;
    for (const timeSetting of mapHeaderOutput.timeSettings) {
        buffer.writeUInt8(timeSetting, offset);
        offset += 1;
    }

    buffer.writeUInt32LE(mapHeaderOutput.selectedTribeSkins.length, offset);
    offset += 4;
    for (const tribeSkin of mapHeaderOutput.selectedTribeSkins) {
        buffer.writeUInt16LE(tribeSkin.tribe, offset);
        offset += 2;
        buffer.writeUInt16LE(tribeSkin.skin, offset);
        offset += 2;
    }

    buffer.writeUInt16LE(mapHeaderOutput.mapWidth, offset);
    offset += 2;
    buffer.writeUInt16LE(mapHeaderOutput.mapHeight, offset);
    offset += 2;

    return buffer.subarray(0, offset);
}
