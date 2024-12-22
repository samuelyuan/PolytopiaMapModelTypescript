import * as fs from 'fs';
import { PolytopiaSaveOutput } from './fileio';
import { MapHeaderOutput } from './mapheader';
import { PlayerData } from './playerdata';
import { TileData } from './tiledata';

interface PolytopiaSaveJson {
  gameName: string;
  fileFormat: string;
  tileData: TileData[][];
  playerData: PlayerData[];
  mapHeaderOutput: MapHeaderOutput;
}

interface CityLocationData {
  x: number;
  y: number;
  cityName: string;
  capital: number;
}

export function importPolytopiaDataFromJson(inputFilename: string): PolytopiaSaveJson {
  const jsonFile = fs.readFileSync(inputFilename, 'utf8');
  const polytopiaSaveJson: PolytopiaSaveJson = JSON.parse(jsonFile);

  if (!polytopiaSaveJson) {
    throw new Error(`The json data in ${inputFilename} is missing or incorrect`);
  }

  return polytopiaSaveJson;
}

export function exportPolytopiaJsonFile(saveOutput: PolytopiaSaveOutput, outputFilename: string) {
  const polytopiaJson: PolytopiaSaveJson = {
    gameName: "Battle of Polytopia",
    fileFormat: "Polytopia Save State",
    tileData: saveOutput.tileData,
    playerData: saveOutput.playerData,
    mapHeaderOutput: saveOutput.mapHeaderOutput,
  };

  const file = JSON.stringify(polytopiaJson, null, 2);
  fs.writeFileSync(outputFilename, file, 'utf8');
}
