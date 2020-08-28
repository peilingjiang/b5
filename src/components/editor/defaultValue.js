const defaultValue = {
  playground: {
    type: 'playground',
    lineStyles: {},
    blocks: {
      0: {
        0: {
          name: 'numberSlider',
          inlineData: [200, 0, 600, 10],
          output: {
            0: [['2', '1', '0']],
          },
        },
        1: {
          name: 'background',
          input: {
            0: null,
            1: null,
            2: null,
            3: null,
          },
        },
      },
      2: {
        1: {
          name: 'ellipse',
          input: {
            0: ['0', '0', '0'],
            1: null,
            2: null,
            3: null,
          },
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
              inlineData: [500],
              output: { 0: [['1', '0', '0']] }, // For block rendering
            },
            1: {
              name: 'numberSlider',
              inlineData: [300, 0, 1000, 50],
              output: { 0: [['1', '0', '1']] }, // One output node may be connected to multiple input nodes
            },
          },
          1: {
            0: {
              name: 'createCanvas',
              input: {
                0: ['0', '0', '0'], // Line number, column number, index of the node
                1: ['0', '1', '0'],
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

export default defaultValue
