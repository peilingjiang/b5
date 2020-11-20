import {
  lineNumberWidth,
  blockAlphabetHeight,
  factoryCanvasDefaultScale,
  sectionHeightDefault,
} from '../constants'

// Default value

export const defaultEditor = {
  playground: {
    type: 'playground',
    lineStyles: {},
    blocks: {
      0: {
        0: {
          name: 'comment',
          source: 'original',
          uuid: '89885483-c57c-4ea4-8588-abe67ef7dc71',
          inlineData: [
            '🌈 Welcome to b5!\nThis is still a work-in-progress project. Right now, please feel free to explore it!',
          ],
        },
        1: {
          name: 'numberSlider',
          source: 'original',
          uuid: 'fdbab34e-f083-4d38-b06c-0e7bf584a662',
          inlineData: [70, 0, 100, 5],
          output: { 0: [['1', '1', '1']] },
        },
      },
      1: {
        1: {
          name: 'circle',
          source: 'original',
          uuid: 'daddd1b9-9ee0-4fd2-976f-5c250af895d9',
          input: { 0: null, 1: ['0', '1', '0'], 2: null },
        },
        2: {
          name: 'comment',
          source: 'original',
          uuid: 'c190ed73-ed0b-40c2-b330-6cbd0581f538',
          inlineData: [
            '😎 By the way, you can double click on the code canvas to add a new block~',
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
              uuid: '363fd6b1-1b3b-4149-945a-cd79b17e492a',
              inlineData: [500],
              output: { 0: [['1', '0', '0']] },
            },
            1: {
              name: 'numberSlider',
              source: 'original',
              uuid: '1c1ad91c-468a-45c0-9798-4185dc71ee77',
              inlineData: [300, 0, 600, 100],
              output: { 0: [['1', '0', '1']] },
            },
          },
          1: {
            0: {
              name: 'createCanvas',
              source: 'original',
              uuid: '53d3acfc-f9c2-469d-bc83-73e2f16ab8d3',
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
