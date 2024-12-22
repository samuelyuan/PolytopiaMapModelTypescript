import { expect } from 'chai';
import { Buffer } from 'buffer';
import {
    readTileData,
    readAllPlayerData,
    buildTribeCityMap
} from '../src/fileio';

describe('fileio.ts', () => {
    describe('readAllPlayerData', () => {
        it('should read all player data and update file offset map', () => {
            const buffer = Buffer.alloc(100);
            const [playerData, offset] = readAllPlayerData(buffer, 0);
            expect(playerData).to.be.an('array');
            expect(offset).to.be.a('number');
        });
    });

    describe('buildTribeCityMap', () => {
        it('should build a tribe city map from tile data', () => {
            const mapHeaderOutput = { mapHeight: 2, mapWidth: 1 } as any;
            const tileData: any[][] = [
                [{ improvementData: { cityName: 'City1' }, improvementType: 1, owner: 1, worldCoordinates: [0, 0], capital: 0 }],
                [{ improvementData: { cityName: 'City2' }, improvementType: 1, owner: 2, worldCoordinates: [1, 1], capital: 0 }]
            ];
            const tribeCityMap = buildTribeCityMap(mapHeaderOutput, tileData);
            expect(tribeCityMap).to.have.property('1');
            expect(tribeCityMap).to.have.property('2');
        });
    });
});