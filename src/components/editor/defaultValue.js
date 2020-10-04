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
          inlineData: [
            '🌈Welcome to b5!\nThis is still a work-in-progress project. Right now, please feel free to explore it!\n- WEAR MASK & STAY SAFE -',
          ],
        },
        1: {
          name: 'numberSlider',
          source: 'original',
          inlineData: [200, 0, 600, 10],
          output: {
            0: [['1', '1', '1']],
          },
        },
        // 1: {
        //   name: 'cnv',
        //   source: 'custom',
        //   output: {
        //     0: [],
        //   },
        // },
      },
      1: {
        1: {
          name: 'circle',
          source: 'original',
          input: {
            0: null,
            1: ['0', '1', '0'],
            2: null,
          },
        },
        2: {
          name: 'comment',
          source: 'original',
          inlineData: [
            '😎By the way, you can double click on the code canvas to add a block~',
          ],
        },
      },
    },
  },
  factory: {
    variable: [
      // 0 (The whole section canvas)
      {
        /* --- data --- */
        name: 'cnv' /* For the section/constructed block */,
        removable: false /* Can we delete the section? */,
        type: 'variable' /* What is the type of the customized block? */,
        lineStyles: {} /* lineStyles */,
        blocks: {
          /* blocks */
          0: {
            /* Line number - start from 0 */
            0: {
              /* Column number - start from 0 */
              name: 'number',
              source: 'original',
              inlineData: [500],
              output: { 0: [['1', '0', '0']] }, // For block rendering
            },
            1: {
              name: 'numberSlider',
              source: 'original',
              inlineData: [300, 0, 600, 50],
              output: { 0: [['1', '0', '1']] }, // One output node may be connected to multiple input nodes
            },
          },
          1: {
            0: {
              name: 'createCanvas',
              source: 'original',
              input: {
                0: ['0', '0', '0'], // Line number, column number, index of the node
                1: ['0', '1', '0'],
                2: null,
              },
              output: {
                0: [],
              },
            },
          },
        },
      },
      // 1...
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
    name: '',
    removable: true,
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
