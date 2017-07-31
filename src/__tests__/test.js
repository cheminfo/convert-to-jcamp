import convertToJcamp from '..';
import {convert} from 'jcampconverter';

const testData = `1 2
2 3
3 4
4 5
5 6
6 7
7 8
8 9`;

describe('convertToJcamp', () => {
    it('check valid with jcampconverter', () => {
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
            }
        };
        var jcamp = convertToJcamp(testData, options);
        var jcampObject = convert(jcamp);

        expect(jcampObject.spectra).toEqual([
            {
                data: [[
                    1, 2,
                    2, 3,
                    3, 4,
                    4, 5,
                    5, 6,
                    6, 7,
                    7, 8,
                    8, 9
                ]],
                dataType: 'MASS SPECTRUM',
                firstX: 1,
                firstY: 2,
                isPeaktable: true,
                lastX: 8,
                lastY: 9,
                nbPoints: 8,
                title: 'test',
                xFactor: 1,
                xUnit: 'M/Z',
                yFactor: 1,
                yUnit: 'relative abundance'
            }
        ]);
    });
});
