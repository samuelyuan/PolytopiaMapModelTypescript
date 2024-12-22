import * as fs from 'fs';
import { Buffer } from 'buffer';
import { ImprovementData } from './improvementdata';
import { deserializeMapHeaderFromBytes, MapHeaderOutput } from './mapheader';
import { deserializePlayerDataFromBytes, PlayerData } from './playerdata';
import { deserializeTileDataFromBytes, UnitData } from './tiledata';

export interface PolytopiaSaveOutput {
  mapHeight: number;
  mapWidth: number;
  gameVersion: number;
  mapHeaderOutput: MapHeaderOutput;
  initialTileData: TileData[][];
  initialPlayerData: PlayerData[];
  tileData: TileData[][];
  maxTurn: number;
  playerData: PlayerData[];
  fileOffsetMap: { [key: string]: number };
  tribeCityMap: { [key: number]: CityLocationData[] };
}

interface CityLocationData {
  x: number;
  y: number;
  cityName: string;
  capital: number;
}

interface UnitLocationData {
  x: number;
  y: number;
  unitType: number;
}

interface MapHeaderInput {
  version1: number;
  currentTurn: number;
}

interface TileData {
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

let fileOffsetMap: { [key: string]: number } = {};

function unsafeReadUint16(buffer: Buffer, offset: number): [number, number] {
  const value = buffer.readUInt16LE(offset);
  offset += 2;
  return [value, offset];
}

function updateFileOffsetMap(fileOffsetMap: { [key: string]: number }, offset: number, unitLocationKey: string) {
  fileOffsetMap[unitLocationKey] = offset;
}

function buildMapStartKey(): string {
  return "MapStart";
}

function buildMapEndKey(): string {
  return "MapEnd";
}

function buildTileStartKey(x: number, y: number): string {
  return `TileStart${x},${y}`;
}

function buildTileEndKey(x: number, y: number): string {
  return `TileEnd${x},${y}`;
}

function buildAllPlayersStartKey(): string {
  return "AllPlayersStart";
}

function buildAllPlayersEndKey(): string {
  return "AllPlayersEnd";
}

function buildMapHeaderStartKey(): string {
  return "MapHeaderStart";
}

function buildMapHeaderEndKey(): string {
  return "MapHeaderEnd";
}

export function readTileData(buffer: Buffer, offset: number, tileData: TileData[][], mapWidth: number, mapHeight: number, gameVersion: number): number {
  updateFileOffsetMap(fileOffsetMap, offset, buildMapStartKey());

  for (let i = 0; i < mapHeight; i++) {
    for (let j = 0; j < mapWidth; j++) {
      const tileStartKey = buildTileStartKey(j, i);
      updateFileOffsetMap(fileOffsetMap, offset, tileStartKey);

      [tileData[i][j], offset] = deserializeTileDataFromBytes(buffer, offset, i, j, gameVersion);

      const tileEndKey = buildTileEndKey(j, i);
      updateFileOffsetMap(fileOffsetMap, offset, tileEndKey);
    }
  }

  updateFileOffsetMap(fileOffsetMap, offset, buildMapEndKey());
  return offset;
}

export function readAllPlayerData(buffer: Buffer, offset: number): [PlayerData[], number] {
  const allPlayersStartKey = buildAllPlayersStartKey();
  updateFileOffsetMap(fileOffsetMap, offset, allPlayersStartKey);

  let numPlayers: number;
  [numPlayers, offset] = unsafeReadUint16(buffer, offset);
  const allPlayerData: PlayerData[] = [];

  for (let i = 0; i < numPlayers; i++) {
    let playerData: PlayerData;
    [playerData, offset] = deserializePlayerDataFromBytes(buffer, offset);
    allPlayerData.push(playerData);
  }

  const allPlayersEndKey = buildAllPlayersEndKey();
  updateFileOffsetMap(fileOffsetMap, offset, allPlayersEndKey);

  return [allPlayerData, offset];
}

export function buildTribeCityMap(currentMapHeaderOutput: MapHeaderOutput, tileData: TileData[][]): { [key: number]: CityLocationData[] } {
  const tribeCityMap: { [key: number]: CityLocationData[] } = {};
  for (let i = 0; i < currentMapHeaderOutput.mapHeight; i++) {
    for (let j = 0; j < currentMapHeaderOutput.mapWidth; j++) {
      if (tileData[i][j].improvementData && tileData[i][j].improvementType === 1) {
        const tribeOwner = tileData[i][j].owner;
        if (!tribeCityMap[tribeOwner]) {
          tribeCityMap[tribeOwner] = [];
        }

        const cityName = tileData[i][j].improvementData?.cityName ?? "";

        const cityLocationData: CityLocationData = {
          x: tileData[i][j].worldCoordinates[0],
          y: tileData[i][j].worldCoordinates[1],
          cityName: cityName,
          capital: tileData[i][j].capital,
        };
        tribeCityMap[tribeOwner].push(cityLocationData);
      }
    }
  }
  return tribeCityMap;
}

export function readPolytopiaDecompressedFile(inputFilename: string): PolytopiaSaveOutput | null {
  const inputFile = fs.readFileSync(inputFilename);
  const buffer = Buffer.from(inputFile);
  let offset = 0;

  fileOffsetMap = {};

  // Read initial map state
  updateFileOffsetMap(fileOffsetMap, offset, buildMapHeaderStartKey());
  let initialMapHeaderOutput: MapHeaderOutput;
  [initialMapHeaderOutput, offset] = deserializeMapHeaderFromBytes(buffer, offset);
  updateFileOffsetMap(fileOffsetMap, offset, buildMapHeaderEndKey());

  const initialTileData: TileData[][] = Array.from({ length: initialMapHeaderOutput.mapHeight }, () => Array(initialMapHeaderOutput.mapWidth).fill(null));
  const gameVersion = initialMapHeaderOutput.mapHeaderInput.version1;
  offset = readTileData(buffer, offset, initialTileData, initialMapHeaderOutput.mapWidth, initialMapHeaderOutput.mapHeight, gameVersion);
  let initialPlayerData: PlayerData[];
  [initialPlayerData, offset] = readAllPlayerData(buffer, offset);

  offset += 3; // Skip 3 bytes

  // Read current map state
  updateFileOffsetMap(fileOffsetMap, offset, buildMapHeaderStartKey());
  let currentMapHeaderOutput: MapHeaderOutput;
  [currentMapHeaderOutput, offset] = deserializeMapHeaderFromBytes(buffer, offset);
  updateFileOffsetMap(fileOffsetMap, offset, buildMapHeaderEndKey());

  const tileData: TileData[][] = Array.from({ length: currentMapHeaderOutput.mapHeight }, () => Array(currentMapHeaderOutput.mapWidth).fill(null));
  offset = readTileData(buffer, offset, tileData, currentMapHeaderOutput.mapWidth, currentMapHeaderOutput.mapHeight, gameVersion);
  let playerData: PlayerData[];
  [playerData, offset] = readAllPlayerData(buffer, offset);

  const tribeCityMap = buildTribeCityMap(currentMapHeaderOutput, tileData);

  return {
    mapHeight: currentMapHeaderOutput.mapHeight,
    mapWidth: currentMapHeaderOutput.mapWidth,
    gameVersion: gameVersion,
    mapHeaderOutput: currentMapHeaderOutput,
    initialTileData: initialTileData,
    initialPlayerData: initialPlayerData,
    tileData: tileData,
    maxTurn: currentMapHeaderOutput.mapHeaderInput.currentTurn,
    playerData: playerData,
    fileOffsetMap: fileOffsetMap,
    tribeCityMap: tribeCityMap,
  };
}
