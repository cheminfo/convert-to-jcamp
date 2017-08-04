import convertToJcamp from '..';
import {convert} from 'jcampconverter';

describe('convertToJcamp gcms', () => {
    it('check valid with jcampconverter', () => {
        const testData = `1 2
2 3
3 4
4 5
5 6
6 7
7 8
8 9`;
        var options = {
            title: 'test',
            owner: 'cheminfo',
            origin: 'manually',
            type: 'MASS SPECTRUM',
            xUnit: 'M/Z',
            yUnit: 'relative abundance',
            info: {
                info1: 'value1',
                info2: 'value2'
            },
            newGCMS: true
        };
        var jcamp = convertToJcamp(testData, options);
        var jcampObject = convert(jcamp, {newGCMS: true});

        expect(jcampObject.gcms).toEqual({
            series: [
                {
                    data: [
                        [[], []], [[], []], [[], []], [[], []], [[], []], [[], []], [[], []], [[], []]
                    ],
                    dimension: 2,
                    name: 'ms'
                },
                {
                    data: [2, 3, 4, 5, 6, 7, 8, 9],
                    dimension: 1,
                    name: 'tic'
                },
                {
                    data: [1, 2, 3, 4, 5, 6, 7, 8],
                    dimension: 1,
                    name: 'scannumber'
                }
            ],
            times: [1, 2, 3, 4, 5, 6, 7, 8]
        });
    });
});
