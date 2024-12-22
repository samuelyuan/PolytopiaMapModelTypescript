import { expect } from 'chai';
import 'mocha';
import { 
  PlayerData, 
  buildEmptyPlayer, 
  deserializePlayerDataFromBytes,
  serializePlayerDataToBytes 
} from '../src/playerdata';

const playerData: PlayerData = {
    playerId: 1,
    name: "TestPlayer",
    accountId: "00000000-0000-0000-0000-000000000000",
    autoPlay: true,
    startTileCoordinates: [6, 22],
    tribe: 15,
    unknownByte1: 1,
    difficultyHandicap: 1,
    aggressionsByPlayers: [
      { playerId: 1, aggression: 0 },
      { playerId: 2, aggression: 17744 },
      { playerId: 3, aggression: 73048 },
      { playerId: 4, aggression: 24359 },
      { playerId: 5, aggression: 74462 },
      { playerId: 6, aggression: 85466 },
      { playerId: 7, aggression: 64134 },
      { playerId: 8, aggression: 39411 },
      { playerId: 9, aggression: 36739 },
      { playerId: 10, aggression: 37812 },
      { playerId: 11, aggression: 22858 },
      { playerId: 12, aggression: 32007 },
      { playerId: 13, aggression: 17738 },
      { playerId: 14, aggression: 41794 },
      { playerId: 15, aggression: 55461 },
      { playerId: 16, aggression: 32041 },
      { playerId: 255, aggression: 0 },
    ],
    currency: 900,
    score: 10000,
    unknownInt2: 0,
    numCities: 11,
    availableTech: [0, 8, 15, 10, 39, 18, 13, 1, 4, 14, 20],
    encounteredPlayers: [7, 11, 3, 5, 10],
    tasks: [
      { type: 6, buffer: [1, 1] },
      { type: 5, buffer: [1, 1, 10, 0, 0, 0] },
      { type: 8, buffer: [1, 0] },
      { type: 3, buffer: [1, 1] },
    ],
    totalUnitsKilled: 28,
    totalUnitsLost: 32,
    totalTribesDestroyed: 1,
    overrideColor: [153, 0, 255, 255],
    overrideTribe: 0,
    uniqueImprovements: [27],
    diplomacyArr: [
      { playerId: 1, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 2, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 3, diplomacyRelationState: 0, lastAttackTurn: 21, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: 7, embassyBuildTurn: -100, previousAttackTurn: 21 },
      { playerId: 4, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 5, diplomacyRelationState: 0, lastAttackTurn: 19, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: 8, embassyBuildTurn: -100, previousAttackTurn: 21 },
      { playerId: 6, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 7, diplomacyRelationState: 0, lastAttackTurn: 20, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: 0, embassyBuildTurn: -100, previousAttackTurn: 21 },
      { playerId: 8, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 9, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 10, diplomacyRelationState: 0, lastAttackTurn: 15, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: 13, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 11, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: 0, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 12, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 13, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 14, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 15, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 16, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 255, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
      { playerId: 0, diplomacyRelationState: 0, lastAttackTurn: -100, embassyLevel: 0, lastPeaceBrokenTurn: -100, firstMeet: -100, embassyBuildTurn: -100, previousAttackTurn: -100 },
    ],
    diplomacyMessages: [],
    destroyedByTribe: 0,
    destroyedTurn: 0,
    unknownBuffer2: [255, 255, 255, 255],
    endScore: -1,
    playerSkin: 0,
    unknownBuffer3: [255, 255, 255, 255],
  };

const playerBytes = Buffer.from([
    1,
    // Player name
    10, 84, 101, 115, 116, 80, 108, 97, 121, 101, 114,
    // Account Id
    36, 48, 48, 48, 48, 48, 48, 48, 48, 45, 48, 48, 48, 48, 45, 48, 48, 48, 48, 45, 48, 48, 48, 48, 45, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48,
    1, 6, 0, 0, 0, 22, 0, 0, 0, 15, 0, 1, 1, 0, 0, 0,
    // Unknown Array 1
    17, 0,
    1, 0, 0, 0, 0, 2, 80, 69, 0, 0, 3, 88, 29, 1, 0, 4, 39, 95, 0, 0, 5, 222, 34, 1, 0,
    6, 218, 77, 1, 0, 7, 134, 250, 0, 0, 8, 243, 153, 0, 0, 9, 131, 143, 0, 0, 10, 180, 147, 0, 0,
    11, 74, 89, 0, 0, 12, 7, 125, 0, 0, 13, 74, 69, 0, 0, 14, 66, 163, 0, 0, 15, 165, 216, 0, 0,
    16, 41, 125, 0, 0, 255, 0, 0, 0, 0,
    // currency
    132, 3, 0, 0,
    // score
    16, 39, 0, 0,
    0, 0, 0, 0,
    // num cities
    11, 0,
    // tech
    11, 0, 0, 0, 8, 0, 15, 0, 10, 0, 39, 0, 18, 0, 13, 0, 1, 0, 4, 0, 14, 0, 20, 0,
    // encountered players
    5, 0, 7, 11, 3, 5, 10,
    // tasks
    4, 0, 6, 0, 1, 1, 5, 0, 1, 1, 10, 0, 0, 0, 8, 0, 1, 0, 3, 0, 1, 1,
    28, 0, 0, 0,
    32, 0, 0, 0,
    1, 0, 0, 0,
    // override color
    153, 0, 255, 255,
    0,
    // improvements
    1, 0, 27, 0,
    18, 0, 1, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 2, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 3, 0, 21, 0, 0, 0, 0, 156, 255, 255, 255, 7, 0, 0, 0, 156, 255, 255, 255, 21, 0, 0, 0, 4, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 5, 0, 19, 0, 0, 0, 0, 156, 255, 255, 255, 8, 0, 0, 0, 156, 255, 255, 255, 21, 0, 0, 0, 6, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 7, 0, 20, 0, 0, 0, 0, 156, 255, 255, 255, 0, 0, 0, 0, 156, 255, 255, 255, 21, 0, 0, 0, 8, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 9, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 10, 0, 15, 0, 0, 0, 0, 156, 255, 255, 255, 13, 0, 0, 0, 156, 255, 255, 255, 156, 255, 255, 255, 11, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 0, 0, 0, 0, 156, 255, 255, 255, 156, 255, 255, 255, 12, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 13, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 14, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 15, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 16, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 255, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 0, 0, 156, 255, 255, 255, 0, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 156, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 255, 255, 255, 255,
  ]);

describe('PlayerData Serialization', () => {
    it('should deserialize PlayerData from bytes correctly', () => {
      const [result, offset] = deserializePlayerDataFromBytes(playerBytes, 0);
      const expected = playerData;
  
      expect(result).to.deep.equal(expected);
      expect(offset).to.equal(playerBytes.length);
    });
  
    it('should serialize PlayerData to bytes correctly', () => {
      const resultBytes = serializePlayerDataToBytes(playerData);
      const expectedBytes = playerBytes;
  
      expect(resultBytes).to.deep.equal(expectedBytes);
    });
  
    it('should serialize an empty player correctly', () => {
      const resultBytes = serializePlayerDataToBytes(buildEmptyPlayer(17, "Player17", { r: 100, g: 150, b: 200, a: 255 }));
      const expectedBytes = Buffer.from([
        17,
        // Player name
        8, 80, 108, 97, 121, 101, 114, 49, 55,
        // 00000000-0000-0000-0000-000000000000
        36, 48, 48, 48, 48, 48, 48, 48, 48, 45, 48, 48, 48, 48, 45, 48, 48, 48, 48, 45, 48, 48, 48, 48, 45, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 2, 0, 0, 0,
        18, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 5, 0, 0, 0, 0, 6, 0, 0, 0, 0, 7, 0, 0, 0, 0,
        8, 0, 0, 0, 0, 9, 0, 0, 0, 0, 10, 0, 0, 0, 0, 11, 0, 0, 0, 0, 12, 0, 0, 0, 0, 13, 0, 0, 0, 0, 14, 0, 0, 0, 0,
        15, 0, 0, 0, 0, 16, 0, 0, 0, 0, 17, 0, 0, 0, 0, 255, 0, 0, 0, 0,
        5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        // override color
        200, 150, 100, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 255, 255, 255, 255,
      ]);
  
      expect(resultBytes).to.deep.equal(expectedBytes);
    });
});