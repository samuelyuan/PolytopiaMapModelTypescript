import { expect } from 'chai';
import { describe, it } from 'mocha';
import { 
  deserializeTileDataFromBytes, 
  serializeTileToBytes,
  deserializeUnitDataFromBytes,
  serializeUnitDataToBytes, 
  TileData, 
  UnitData, 
} from '../src/tiledata';

describe('TileData Tests', () => {
  it('should deserialize empty tile data from bytes correctly', () => {
    const inputByteData = Buffer.from([
      3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 8, 0, 1, 0, 0, 0,
      // coordinates
      255, 255, 255, 255, 255, 255, 255, 255,
      // resource
      0,
      // improvement
      0,
      0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    const [result, offset] = deserializeTileDataFromBytes(inputByteData, 0, 1, 3, 104);
    const expected: TileData = {
      worldCoordinates: [3, 1],
      terrain: 3,
      climate: 8,
      altitude: 1,
      owner: 0,
      capital: 0,
      capitalCoordinates: [-1, -1],
      resourceExists: false,
      resourceType: -1,
      improvementExists: false,
      improvementType: -1,
      improvementData: null,
      unit: null,
      passengerUnit: null,
      unitEffectData: [],
      unitDirectionData: [],
      passengerUnitEffectData: [],
      passengerUnitDirectionData: [],
      playerVisibility: [],
      hasRoad: false,
      hasWaterRoute: false,
      tileSkin: 0,
      unknown: [0, 0],
      floodedFlag: 0,
      floodedValue: 0,
    };

    expect(result).to.deep.equal(expected);
    expect(offset).to.equal(inputByteData.length);
  });

  it('should deserialize unit data to bytes correctly', () => {
    const inputByteData = Buffer.from([
      4, 0, 0, 0, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 2, 0, 0, 0, 8, 0, 0, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    const [result, offset] = deserializeUnitDataFromBytes(inputByteData, 0);
    const expected: UnitData = {
      id: 4,
      owner: 4,
      unitType: 2,
      followerUnitId: 0,
      leaderUnitId: 0,
      currentCoordinates: [8, 2],
      homeCoordinates: [8, 2],
      health: 100,
      promotionLevel: 0,
      experience: 0,
      moved: false,
      attacked: false,
      flipped: false,
      createdTurn: 0,
    };
    expect(result).to.deep.equal(expected);
    expect(offset).to.equal(inputByteData.length);
  });

  it('should serialize empty tile data to bytes correctly', () => {
    const tileData: TileData = {
      worldCoordinates: [3, 1],
      terrain: 3,
      climate: 8,
      altitude: 1,
      owner: 0,
      capital: 0,
      capitalCoordinates: [-1, -1],
      resourceExists: false,
      resourceType: -1,
      improvementExists: false,
      improvementType: -1,
      improvementData: null,
      unit: null,
      passengerUnit: null,
      unitEffectData: [],
      unitDirectionData: [],
      passengerUnitEffectData: [],
      passengerUnitDirectionData: [],
      playerVisibility: [],
      hasRoad: false,
      hasWaterRoute: false,
      tileSkin: 0,
      unknown: [0, 0],
      floodedFlag: 0,
      floodedValue: 0,
    };
    const versionNumber = 104;
    const resultBytes = serializeTileToBytes(tileData, versionNumber);
    const expectedBytes = Buffer.from([
      3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 8, 0, 1, 0, 0, 0,
      // coordinates
      255, 255, 255, 255, 255, 255, 255, 255,
      // resource
      0,
      // improvement
      0,
      0, 0, 0, 0, 0, 0, 0, 0,
    ]);

    expect(resultBytes).to.deep.equal(expectedBytes);
  });

  it('should serialize tile data with improvement to bytes correctly', () => {
    const tileData: TileData = {
      worldCoordinates: [3, 1],
      terrain: 3,
      climate: 8,
      altitude: 1,
      owner: 0,
      capital: 0,
      capitalCoordinates: [-1, -1],
      resourceExists: false,
      resourceType: -1,
      improvementExists: true,
      improvementType: 1,
      improvementData: {
        level: 1,
        foundedTurn: 0,
        currentPopulation: 0,
        totalPopulation: 0,
        production: 1,
        baseScore: 0,
        borderSize: 1,
        upgradeCount: 0,
        connectedPlayerCapital: 0,
        hasCityName: 0,
        cityName: '',
        foundedTribe: 0,
        cityRewards: [],
        rebellionFlag: 0,
        rebellionBuffer: [],
      },
      unit: null,
      passengerUnit: null,
      unitEffectData: [],
      unitDirectionData: [],
      passengerUnitEffectData: [],
      passengerUnitDirectionData: [],
      playerVisibility: [],
      hasRoad: false,
      hasWaterRoute: false,
      tileSkin: 0,
      unknown: [0, 0],
      floodedFlag: 0,
      floodedValue: 0,
    };

    const versionNumber = 104;
    const resultBytes = serializeTileToBytes(tileData, versionNumber);
    const expectedBytes = Buffer.from([
      3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 8, 0, 1, 0, 0, 0,
      // coordinates
      255, 255, 255, 255, 255, 255, 255, 255,
      // resource
      0,
      // improvement
      1, 1, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);

    expect(resultBytes).to.deep.equal(expectedBytes);
  });

  it('should serialize tile data with unit to bytes correctly', () => {
    const tileData: TileData = {
      worldCoordinates: [3, 1],
      terrain: 3,
      climate: 8,
      altitude: 1,
      owner: 0,
      capital: 0,
      capitalCoordinates: [-1, -1],
      resourceExists: false,
      resourceType: -1,
      improvementExists: false,
      improvementType: -1,
      improvementData: null,
      unit: {
        id: 4,
        owner: 4,
        unitType: 2,
        followerUnitId: 0,
        leaderUnitId: 0,
        currentCoordinates: [3, 1],
        homeCoordinates: [3, 1],
        health: 100,
        promotionLevel: 0,
        experience: 0,
        moved: false,
        attacked: false,
        flipped: false,
        createdTurn: 0,
      },
      passengerUnit: null,
      unitEffectData: [1],
      unitDirectionData: [255, 255, 1, 0, 0],
      passengerUnitEffectData: [],
      passengerUnitDirectionData: [],
      playerVisibility: [],
      hasRoad: false,
      hasWaterRoute: false,
      tileSkin: 0,
      unknown: [0, 0],
      floodedFlag: 0,
      floodedValue: 0,
    };

    const versionNumber = 104;
    const resultBytes = serializeTileToBytes(tileData, versionNumber);
    const expectedBytes = Buffer.from([
      3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 8, 0, 1, 0, 0, 0,
      // coordinates
      255, 255, 255, 255, 255, 255, 255, 255,
      // resource
      0,
      // improvement
      0,
      1, 4, 0, 0, 0, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 255, 255, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  
    expect(resultBytes).to.deep.equal(expectedBytes);
  });

  it('should serialize unit data to bytes correctly', () => {
    const unitData: UnitData = {
      id: 4,
      owner: 4,
      unitType: 2,
      followerUnitId: 0,
      leaderUnitId: 0,
      currentCoordinates: [8, 2],
      homeCoordinates: [8, 2],
      health: 100,
      promotionLevel: 0,
      experience: 0,
      moved: false,
      attacked: false,
      flipped: false,
      createdTurn: 0,
    };
    const resultBytes = serializeUnitDataToBytes(unitData);
    const expectedBytes = Buffer.from([
      4, 0, 0, 0, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 2, 0, 0, 0, 8, 0, 0, 0, 2, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);

    expect(resultBytes).to.deep.equal(expectedBytes);
  });
});