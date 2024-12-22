import { expect } from 'chai';
import { describe, it } from 'mocha';
import { deserializeMapHeaderFromBytes, serializeMapHeaderToBytes, MapHeaderOutput } from '../src/mapheader';

const mapHeaderOutput: MapHeaderOutput = {
    mapHeaderInput: {
        version1: 0,
        version2: 104,
        totalActions: 300,
        currentTurn: 5,
        currentPlayerIndex: 0,
        maxUnitId: 50,
        currentGameState: 2,
        seed: 999999999,
        turnLimit: 0,
        scoreLimit: 0,
        winByCapital: 0,
        unknownSettings: new Uint8Array([0, 1, 0, 1, 0, 0]),
        gameModeBase: 5,
        gameModeRules: 6,
    },
    mapName: 'Test Map',
    mapSquareSize: 16,
    disabledTribesArr: [3, 5, 16, 17],
    unlockedTribesArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    gameDifficulty: 1,
    numOpponents: 15,
    gameType: 0,
    mapPreset: 3,
    turnTimeLimitMinutes: 1440,
    unknownFloat1: 0.0,
    unknownFloat2: 0.0,
    baseTimeSeconds: 86400,
    timeSettings: [0, 0, 0, 0],
    selectedTribeSkins: [{ tribe: 11, skin: 14 }],
    mapWidth: 16,
    mapHeight: 16,
};

const mapHeaderBytes = new Uint8Array([
    0, 0, 0, 0, 104, 0, 0, 0, 44, 1, 5, 0, 0, 0, 0, 50, 0, 0, 0, 2,
    255, 201, 154, 59, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 5, 6,
    8, 84, 101, 115, 116, 32, 77, 97, 112, 16, 0, 0, 0,
    4, 0, 3, 0, 5, 0, 16, 0, 17, 0,
    18, 0, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0, 9, 0, 10, 0, 11, 0, 12, 0, 13, 0, 14, 0, 15, 0, 16, 0, 17, 0,
    1, 0, 15, 0, 0, 0, 0, 0, 3,
    160, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 192, 168, 71, 0, 0, 0, 0,
    1, 0, 0, 0, 11, 0, 14, 0,
    16, 0, 16, 0,
]);

describe('MapHeader Serialization/Deserialization', () => {
    it('should deserialize map header from bytes correctly', () => {
        const [result, offset] = deserializeMapHeaderFromBytes(Buffer.from(mapHeaderBytes.buffer), 0);
        expect(result).to.deep.equal(mapHeaderOutput);
        expect(offset).to.equal(mapHeaderBytes.length);
    });

    it('should serialize map header to bytes correctly', () => {
        const resultBytes = serializeMapHeaderToBytes(mapHeaderOutput);
        expect(new Uint8Array(resultBytes)).to.deep.equal(mapHeaderBytes);
    });
});