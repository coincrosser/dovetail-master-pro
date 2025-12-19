import { WoodType, JointAngle, JointConfig } from './types.ts';

export const DEFAULT_CONFIG: JointConfig = {
  boardWidth: 3.5,
  boardThickness: 0.75,
  boardLength: 8.0,
  pinWidth: 0.1875, // 3/16"
  angle: JointAngle.ONE_TO_SIX,
  woodType: WoodType.HARDWOOD,
  numTails: 4,
  tailWidthAtBase: 0.625,
  tailWidthAtTop: 0.875
};

export const ANGLE_LABELS = {
  [JointAngle.ONE_TO_FIVE]: '1:5 (Softwood)',
  [JointAngle.ONE_TO_SIX]: '1:6 (General)',
  [JointAngle.ONE_TO_EIGHT]: '1:8 (Hardwood)'
};

export const WOOD_TYPES = [
  { id: WoodType.SOFTWOOD, label: 'Softwood (Pine, Cedar)' },
  { id: WoodType.HARDWOOD, label: 'Hardwood (Oak, Walnut)' },
  { id: WoodType.EXOTIC, label: 'Exotic (Teak, Ipe)' }
];

export interface JointPreset extends JointConfig {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master';
  imageUrl: string;
  recommendedWood: string;
  context: string;
  history: string;
  technicalDetails?: string[];
}

// PHOTOREALISTIC SVG ASSETS
const IMG_LONDONER = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgODAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZzEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzQ1MWEwMyIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiM1NDIwMDUiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzQ1MWEwMyIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImcyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2YTMzMTIiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzQ1MWEwMyIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8ZmlsdGVyIGlkPSJmMSIgeD0iLTIwJSIgeT0iLTIwJSIgd2lkdGg9IjE0MCUiIGhlaWdodD0iMTQwJSI+CiAgICAgIDxmZURyb3BTaGFkb3cgZHg9IjEwIiBkeT0iMTAiIHN0ZERldmlhdGlvbj0iNSIgZmxvZC1vcGFjaXR5PSIwLjUiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzBkMTExNyIvPgogIDxnIGZpbHRlcj0idXJsKCNmMSkiPgogICAgPHJlY3QgeD0iMTAwIiB5PSIzMDAiIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2cxKSIvPgogICAgPHJlY3QgeD0iNTAwIiB5PSIzMDAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJ1cmwoI2cyKSIvPgogICAgPCEtLSBOZWVkbGUgUGlucyAtLT4KICAgIDxnIGZpbHRlbj0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE1MCwgMTUwKSI+CiAgICAgIDxwYXRoIGQ9Ik01MDAgMzEwIGwtMjAgLTIwIGg0MCB6Ii8+CiAgICAgIDxwYXRoIGQ9Ik01MDAgMzYwIGwtMjAgLTIwIGg0MCB6Ii8+CiAgICAgIDxwYXRoIGQ9Ik01MDAgNDEwIGwtMjAgLTIwIGg0MCB6Ii8+CiAgICAgIDxwYXRoIGQ9Ik01MDAgNDYwIGwtMjAgLTIwIGg0MCB6Ii8+CiAgICAgIDxwYXRoIGQ9Ik01MDAgNTEwIGwtMjAgLTIwIGg0MCB6Ii8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4==`;

const IMG_ARTISAN = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgODAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0id2FscHV0R3JhaW4iIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0NTFhMDMiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMjUlIiBzdG9wLWNvbG9yPSIjNTQyMDA1IiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzQ1MWEwMyIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI3NSUiIHN0b3AtY29sb3I9IiM2YTMzMTIiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzQ1MWEwMyIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjMGYxNzJhIi8+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoLTEwLCA0MDAsIDQwMCkiPgogICAgPHJlY3QgeD0iMjAwIiB5PSIyMDAiIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI3dhbHB1dEdyYWluKSIgcng9IjQiLz4KICAgIDxnIGZpbHRlbj0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9IiM5MjQwMGUiIHN0cm9rZT0iIzQ1MWEwMyIgc3Ryb2tlLXdpZHRoPSIyIj4KICAgICAgPHBhdGggZD0iTTYwMCAyMjAgbC00MCAtNDAgODAgMCB6Ii8+CiAgICAgIDxwYXRoIGQ6Ik02MDAgMzQwIGwtNDAgLTQwIDgwIDAgeiIvPgogICAgICA8cGF0aCBkPSJNNjAwIDQ2MCBsLTQwIC00MCA4MCAwIHoiLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==`;

const IMG_ARTS = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgODAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ib2FrIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNjN2E0N2EiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdG9wLWNvbG9yPSIjZDJiNDhjIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNjN2E0N2EiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzBhMGYxZCIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE1MCwgMTUwKSI+CiAgICA8cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0idXJsKCNvYWspIiByeD0iNCIvPgogICAgPCEtLSBQcm91ZCBQaW5zIC0tPgogICAgPGcgc3Ryb2tlPSIjYjc5YTZmIiBzdHJva2Utd2lkdGg9IjIiPgogICAgICA8cmVjdCB4PSI1MDAiIHk9IjUwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTAwIiBmaWxsPSIjOTI0MDBlIi8+CiAgICAgIDxyZWN0IHg9IjUwMCIgeT0iMjAwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTAwIiBmaWxsPSIjOTI0MDBlIi8+CiAgICAgIDxyZWN0IHg9IjUwMCIgeT0iMzUwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTAwIiBmaWxsPSIjOTI0MDBlIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4=`;

const IMG_JEWELRY = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgODAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ibWFwbGUiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjVmMmU2IiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlY2U3ZDAiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iIzBmMTcyYSIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwgMjAwKSI+CiAgICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNtYXBsZSkiIHJ4PSIzMCIvPgogICAgPGcgc3Ryb2tlPSIjZGNkNWJmIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuNiI+CiAgICAgIDxsaW5lIHgxPSI0MDAiIHkxPSI1MCIgeDI9IjQyMCIgeTI9IjUwIiAvPgogICAgICA8bGluZSB4MT0iNDAwIiB5MT0iODAiIHgyPSI0MjAiIHkyPSI4MCIgLz4KICAgICAgPGxpbmUgeDE9IjQwMCIgeTE9IjExMCIgeDI9IjQyMCIgeTI9IjExMCIgLz4KICAgICAgPGxpbmUgeDE9IjQwMCIgeTE9IjE0MCIgeDI9IjQyMCIgeTI9IjE0MCIgLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==`;

export const JOINT_PRESETS: JointPreset[] = [
  {
    id: 'londoner',
    name: '18th Century Londoner',
    description: 'The height of cabinet-making elegance featuring "needle-point" pins and "oystering" branch-wood veneer patterns.',
    boardWidth: 4.5,
    boardThickness: 0.625,
    boardLength: 10.0,
    pinWidth: 0.046875,
    numTails: 8,
    angle: JointAngle.ONE_TO_EIGHT,
    woodType: WoodType.HARDWOOD,
    difficulty: 'Master',
    recommendedWood: 'Honduran Mahogany',
    context: 'Fine Desk Drawers & Bureau Interiors',
    history: 'A hallmark of Georgian era status, utilizing "The Cabinet-Maker\'s London Book of Prices (1788)" standards.',
    imageUrl: IMG_LONDONER, 
    technicalDetails: [
      "Needle-Point Pins: Scaled for delicate veneered fronts to ensure visual continuity.",
      "Modular Harmony: Case heights divided into 7 or 9 units for structural balance.",
      "Cabinet-Maker's Book (1788): Adherence to historically precise joinery scales."
    ],
    tailWidthAtBase: 0.45,
    tailWidthAtTop: 0.6
  },
  {
    id: 'workshop-artisan',
    name: 'Artisan Workshop Standard',
    description: 'Rugged, high-visibility joinery for tool totes and workbench drawers.',
    boardWidth: 5.5,
    boardThickness: 0.75,
    boardLength: 12.0,
    pinWidth: 0.25,
    numTails: 4,
    angle: JointAngle.ONE_TO_SIX,
    woodType: WoodType.HARDWOOD,
    difficulty: 'Intermediate',
    recommendedWood: 'Walnut or Baltic Birch',
    context: 'Tool Totes & Workbench Storage',
    history: 'A celebration of the workspace heritage.',
    imageUrl: IMG_ARTISAN,
    tailWidthAtBase: 0.75,
    tailWidthAtTop: 1.0
  },
  {
    id: 'arts-crafts',
    name: 'Mission Style Through-Joint',
    description: 'Bold, structural proportions designed to show off the end grain.',
    boardWidth: 6.0,
    boardThickness: 1.125,
    boardLength: 14.0,
    pinWidth: 0.3125,
    numTails: 3,
    angle: JointAngle.ONE_TO_SIX,
    woodType: WoodType.HARDWOOD,
    difficulty: 'Beginner',
    recommendedWood: 'Quarter-Sawn White Oak',
    context: 'Heavy Sideboards & Settles',
    history: 'Popularized by Gustav Stickley.',
    imageUrl: IMG_ARTS,
    tailWidthAtBase: 1.25,
    tailWidthAtTop: 1.6
  },
  {
    id: 'jewelry-box',
    name: 'Fine Jewelry Presentation',
    description: 'Delicate joinery for small keepsakes.',
    boardWidth: 2.25,
    boardThickness: 0.375,
    boardLength: 6.0,
    pinWidth: 0.09375,
    numTails: 5,
    angle: JointAngle.ONE_TO_EIGHT,
    woodType: WoodType.EXOTIC,
    difficulty: 'Intermediate',
    recommendedWood: 'Figured Maple or Cherry',
    context: 'Lidded Gift Boxes & Humidors',
    history: 'Modern fine woodworking style.',
    imageUrl: IMG_JEWELRY,
    tailWidthAtBase: 0.3,
    tailWidthAtTop: 0.4
  }
];