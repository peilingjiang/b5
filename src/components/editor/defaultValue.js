import { v4 as uuidv4 } from 'uuid'

import {
  lineNumberWidth,
  blockAlphabetHeight,
  factoryCanvasDefaultScale,
  sectionHeightDefault,
} from '../constants'

/* ------------------------------ Intro Editor ------------------------------ */

export const introEditor = {
  playground: {
    type: 'playground',
    lineStyles: {},
    blocks: {
      0: {
        0: {
          name: 'comment',
          source: 'original',
          uuid: 'ce2febfa-b953-412b-88c2-66857239742f',
          inlineData: [
            '🌈Welcome to b5!\nThis is still a work-in-progress project. Right now, please feel free to explore it!',
          ],
        },
        1: {
          name: 'canvasSize',
          source: 'original',
          uuid: '8865b392-284f-4367-ae89-629587c72be7',
          output: { 0: [['1', '1', '0']], 1: [] },
        },
      },
      1: {
        0: {
          name: 'fillPicker',
          source: 'original',
          uuid: '3b0eb318-f9d0-4b04-b6bf-9afeb5a9bcc9',
          inlineData: ['#bd10e0ff'],
        },
        1: {
          name: 'fractionSlider',
          source: 'original',
          uuid: '41b305b0-694d-4593-a786-e6b88c08a6a4',
          input: { 0: ['0', '1', '0'] },
          inlineData: [30, 0, 100, 5],
          output: { 0: [['2', '1', '0']] },
        },
        2: {
          name: 'comment',
          source: 'original',
          uuid: 'd5fd7289-d23e-4657-8aaa-cfce7da77ac9',
          inlineData: [
            '🆕Double click to add block\n🖱️Right click to pan around\n🔍Scroll to zoom in and out',
          ],
        },
      },
      2: {
        1: {
          name: 'circle',
          source: 'original',
          uuid: '4f847f8c-6f00-4fbf-ae22-8ff65c295e40',
          input: { 0: ['1', '1', '0'], 1: null, 2: null },
        },
      },
      3: {
        0: {
          name: 'comment',
          source: 'original',
          uuid: 'cffa9677-99bd-40c3-a48a-958d09b91ea9',
          inlineData: [
            '📄Go to the file tab on the top left and you can 🌱 start a new code canvas or ⭐ load a random example!',
          ],
        },
      },
    },
  },
  factory: {
    variable: [
      {
        name: 'cnv',
        type: 'variable',
        lineStyles: {},
        blocks: {
          0: {
            0: {
              name: 'number',
              source: 'original',
              uuid: '1b275743-c820-4f84-810b-4897cf392e1c',
              inlineData: [500],
              output: { 0: [['1', '0', '0']] },
            },
            1: {
              name: 'numberSlider',
              source: 'original',
              uuid: '5f927574-089c-4ca1-b396-30e3e59b7fc9',
              inlineData: [300, 0, 600, 100],
              output: { 0: [['1', '0', '1']] },
            },
          },
          1: {
            0: {
              name: 'createCanvas',
              source: 'original',
              uuid: 'd5e8f17b-70fc-4701-b96c-cd727062fccd',
              input: {
                0: ['0', '0', '0'],
                1: ['0', '1', '0'],
                2: null,
              },
              output: { 0: [] },
            },
          },
        },
      },
      {
        name: 'newvar1',
        type: 'variable',
        lineStyles: {},
        blocks: {
          0: {
            0: {
              name: 'comment',
              source: 'original',
              uuid: '5efd9f60-8fcb-44bf-8d53-37866307870e',
              inlineData: [
                '➡️The definition of each variable will run for once at the beginning (just like setup in p5.js)',
              ],
            },
          },
          1: {
            0: {
              name: 'comment',
              source: 'original',
              uuid: 'cecc5ebc-adb1-49e7-bd92-c3cc4b5931b4',
              inlineData: [
                '⬇️Drag the bottom line to adjust the height of each section',
              ],
            },
          },
        },
      },
    ],
    function: [],
    object: [],
  },
  version: '0.2.0',
}

export const introEditorCanvasStyle = {
  playground: {
    left: lineNumberWidth,
    top: blockAlphabetHeight,
    scale: 1,
  },
  factory: {
    variable: [
      /* --- canvasStyle --- */
      {
        left: lineNumberWidth,
        top: blockAlphabetHeight,
        scale: factoryCanvasDefaultScale,
        sectionHeight: sectionHeightDefault,
      },
      {
        left: lineNumberWidth,
        top: blockAlphabetHeight,
        scale: factoryCanvasDefaultScale,
        sectionHeight: sectionHeightDefault,
      },
    ],
    function: [],
    object: [],
  },
}

/* ----------------------------- Default Editor ----------------------------- */

export const defaultEditor = {
  playground: {
    type: 'playground',
    lineStyles: {},
    blocks: {
      0: {
        1: {
          name: 'numberSlider',
          source: 'original',
          uuid: uuidv4(),
          inlineData: [70, 0, 100, 5],
          output: { 0: [['1', '1', '1']] },
        },
      },
      1: {
        0: {
          name: 'fillPicker',
          source: 'original',
          uuid: uuidv4(),
          inlineData: ['#bd10e0ff'],
        },
        1: {
          name: 'circle',
          source: 'original',
          uuid: uuidv4(),
          input: { 0: null, 1: ['0', '1', '0'], 2: null },
        },
      },
    },
  },
  factory: {
    variable: [
      {
        name: 'cnv',
        type: 'variable',
        lineStyles: {},
        blocks: {
          0: {
            0: {
              name: 'number',
              source: 'original',
              uuid: uuidv4(),
              inlineData: [500],
              output: { 0: [['1', '0', '0']] },
            },
            1: {
              name: 'numberSlider',
              source: 'original',
              uuid: uuidv4(),
              inlineData: [300, 0, 600, 100],
              output: { 0: [['1', '0', '1']] },
            },
          },
          1: {
            0: {
              name: 'createCanvas',
              source: 'original',
              uuid: uuidv4(),
              input: {
                0: ['0', '0', '0'],
                1: ['0', '1', '0'],
                2: null,
              },
              output: { 0: [] },
            },
          },
        },
      },
    ],
    function: [],
    object: [],
  },
}

export const defaultEditorCanvasStyle = {
  playground: {
    left: lineNumberWidth,
    top: blockAlphabetHeight,
    scale: 1,
  },
  factory: {
    variable: [
      /* --- canvasStyle --- */
      {
        left: lineNumberWidth,
        top: blockAlphabetHeight,
        scale: factoryCanvasDefaultScale,
        sectionHeight: sectionHeightDefault,
      },
    ],
    function: [],
    object: [],
  },
}

// Structure template

// A section template to add to each tab
const nativeSectionData = {
    name: '' /* Modify before adding... */,
    type: '' /* Modify before adding... */,
    /*
     type should always be 'variable', 'function', and 'object'
     (w/out 's'!) in the data object and passed along the functions
     */
    lineStyles: {},
    blocks: {},
  },
  nativeSectionStyle = {
    left: lineNumberWidth,
    top: blockAlphabetHeight,
    scale: factoryCanvasDefaultScale,
    sectionHeight: sectionHeightDefault,
  }
export const nativeSectionDataToAdd = JSON.stringify(nativeSectionData),
  nativeSectionStyleToAdd = JSON.stringify(nativeSectionStyle)
