import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  deserializeImprovementDataFromBytes, 
  serializeImprovementDataToBytes, 
  ImprovementData 
} from '../src/improvementdata';

describe('ImprovementData Tests', () => {
  it('should deserialize city data from bytes correctly', () => {
    const inputByteData = Buffer.from([3, 0, 0, 0, 1, 0, 6, 0, 1, 0, 0, 0, 1, 0, 254, 255, 1, 1, 4, 84, 101, 115, 116, 0, 2, 0, 4, 0, 7, 0, 0, 0]);
    const [result, offset] = deserializeImprovementDataFromBytes(inputByteData, 0);
    const expected: ImprovementData = {
      level: 3,
      foundedTurn: 0,
      currentPopulation: 1,
      totalPopulation: 6,
      production: 1,
      baseScore: 0,
      borderSize: 1,
      upgradeCount: -2,
      connectedPlayerCapital: 1,
      hasCityName: 1,
      cityName: 'Test',
      foundedTribe: 0,
      cityRewards: [4, 7],
      rebellionFlag: 0,
      rebellionBuffer: [],
    };

    expect(result).to.deep.equal(expected);
    expect(offset).to.equal(inputByteData.length);
  });

  it('should deserialize improvement data from bytes correctly', () => {
    const inputByteData = Buffer.from([1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const [result, offset] = deserializeImprovementDataFromBytes(inputByteData, 0);
    const expected: ImprovementData = {
      level: 1,
      foundedTurn: 0,
      currentPopulation: 0,
      totalPopulation: 0,
      production: 1,
      baseScore: 0,
      borderSize: 0,
      upgradeCount: 0,
      connectedPlayerCapital: 0,
      hasCityName: 0,
      cityName: '',
      foundedTribe: 0,
      cityRewards: [],
      rebellionFlag: 0,
      rebellionBuffer: [],
    };

    expect(result).to.deep.equal(expected);
    expect(offset).to.equal(inputByteData.length);
  });

  it('should serialize city data to bytes correctly', () => {
    const cityData: ImprovementData = {
      level: 3,
      foundedTurn: 0,
      currentPopulation: 1,
      totalPopulation: 6,
      production: 1,
      baseScore: 0,
      borderSize: 1,
      upgradeCount: -2,
      connectedPlayerCapital: 1,
      hasCityName: 1,
      cityName: 'Test',
      foundedTribe: 0,
      cityRewards: [4, 7],
      rebellionFlag: 0,
      rebellionBuffer: [],
    };
    const resultBytes = serializeImprovementDataToBytes(cityData);
    const expectedBytes = Buffer.from([3, 0, 0, 0, 1, 0, 6, 0, 1, 0, 0, 0, 1, 0, 254, 255, 1, 1, 4, 84, 101, 115, 116, 0, 2, 0, 4, 0, 7, 0, 0, 0]);

    expect(resultBytes).to.deep.equal(expectedBytes);
  });

  it('should serialize other improvement data to bytes correctly', () => {
    const improvementData: ImprovementData = {
      level: 1,
      foundedTurn: 0,
      currentPopulation: 0,
      totalPopulation: 0,
      production: 1,
      baseScore: 0,
      borderSize: 0,
      upgradeCount: 0,
      connectedPlayerCapital: 0,
      hasCityName: 0,
      cityName: '',
      foundedTribe: 0,
      cityRewards: [],
      rebellionFlag: 0,
      rebellionBuffer: [],
    };
    const resultBytes = serializeImprovementDataToBytes(improvementData);
    const expectedBytes = Buffer.from([1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    expect(resultBytes).to.deep.equal(expectedBytes);
  });
});